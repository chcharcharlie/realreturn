#![feature(once_cell)]

use bytes::{BufMut, BytesMut};
use std::{ops::Range, sync::Arc};
use tls_client::ClientConnection;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::spawn_local;
use ws_stream_wasm::WsMeta;

use futures::channel::oneshot;
use futures_util::io::AsyncWriteExt;
use tokio_util::compat::FuturesAsyncReadCompatExt;

use hyper::{body::to_bytes, Body, Request, StatusCode};

use tlsn_prover::{Prover, ProverConfig};

pub use tls_client::backend::RustCryptoBackend;
use tls_client::{RootCertStore, ServerName};
use tls_client_async::bind_client;

use rayon::prelude::*;
pub use wasm_bindgen_rayon::{init_thread_pool, wbg_rayon_start_worker};

extern crate web_sys;

// A macro to provide `log!(..)`-style syntax for `console.log` logging.
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

#[wasm_bindgen(module = "post_updates")]
extern "C" {
    fn post_update(a: &str);
}

fn find_ranges_exclude(seq: &[u8], sub_seq: &[&[u8]]) -> Vec<Range<u32>> {
    let mut private_ranges = Vec::new();
    for s in sub_seq {
        for (idx, w) in seq.windows(s.len()).enumerate() {
            if w == *s {
                private_ranges.push(idx as u32..(idx + w.len()) as u32);
            }
        }
    }

    let mut sorted_ranges = private_ranges.clone();
    sorted_ranges.sort_by_key(|r| r.start);

    let mut public_ranges = Vec::new();
    let mut last_end = 0;
    for r in sorted_ranges {
        if r.start > last_end {
            public_ranges.push(last_end..r.start);
        }
        last_end = r.end;
    }

    if last_end < seq.len() as u32 {
        public_ranges.push(last_end..seq.len() as u32);
    }

    public_ranges
}

fn find_ranges_include(seq: &[u8], sub_seq: &[&[u8]]) -> Vec<Range<u32>> {
    let mut public_ranges = Vec::new();
    for s in sub_seq {
        for (idx, w) in seq.windows(s.len()).enumerate() {
            if w == *s {
                public_ranges.push(idx as u32..(idx + w.len()) as u32);
            }
        }
    }
    public_ranges
}

fn find_substring_with_keys(value: &serde_json::Value, keys: Vec<JsValue>) -> String {
    let mut val = value;
    for value_key in keys.clone() {
        val = match val.get(value_key.as_string().unwrap().as_str()) {
            None => return "".to_string(),
            res => res.unwrap(),
        };
    }
    let mut obj: serde_json::Value = serde_json::Value::Null;
    obj[keys[keys.len() - 1].as_string().unwrap().as_str()] = val.clone();
    let res_str = serde_json::to_string(&obj).unwrap();
    log!("substring result!: {}", res_str);
    return res_str[1..res_str.len() - 1].to_string();
}

fn default_root_store() -> RootCertStore {
    let mut root_store = tls_client::RootCertStore::empty();
    root_store.add_server_trust_anchors(webpki_roots::TLS_SERVER_ROOTS.0.iter().map(|ta| {
        tls_client::OwnedTrustAnchor::from_subject_spki_name_constraints(
            ta.subject,
            ta.spki,
            ta.name_constraints,
        )
    }));
    root_store
}

#[wasm_bindgen]
pub async fn requestViaWebsocket(
    server: &str,
    path: &str,
    method: &str,
    data: &str,
    headers: js_sys::Map,
    client_websocket_url: &str,
) -> String {
    let (_, client_socket) = WsMeta::connect(client_websocket_url, None)
        .await
        .expect_throw("assume the client ws connection succeeds");

    let config = tls_client::ClientConfig::builder()
        .with_safe_defaults()
        .with_root_certificates(default_root_store())
        .with_no_client_auth();

    let client = ClientConnection::new(
        Arc::new(config),
        Box::new(RustCryptoBackend::new()),
        ServerName::try_from(server).unwrap(),
    )
    .unwrap();

    let (tls_connection, conn_fut) = bind_client(client_socket.into_io(), client);

    let (conn_sender, _) = oneshot::channel();
    let handled_conn_fut = async {
        match conn_fut.await {
            Ok(conn_res) => {
                // Send the prover
                let _ = conn_sender.send(conn_res);
            }
            Err(err) => {
                panic!("An error occurred in prover_fut: {:?}", err);
            }
        }
    };
    spawn_local(handled_conn_fut);

    // Attach the hyper HTTP client to the TLS connection
    let (mut request_sender, connection) = hyper::client::conn::handshake(tls_connection.compat())
        .await
        .unwrap();

    let (connection_sender, connection_receiver) = oneshot::channel();
    let connection_fut = connection.without_shutdown();
    let handled_connection_fut = async {
        match connection_fut.await {
            Ok(connection_result) => {
                // Send the connection
                let _ = connection_sender.send(connection_result);
            }
            Err(err) => {
                panic!("An error occurred in connection_task: {:?}", err);
            }
        }
    };
    spawn_local(handled_connection_fut);

    let json: serde_json::Value = serde_json::from_str(data).expect("json wrong");
    let mut buf = BytesMut::new().writer();
    serde_json::to_writer(&mut buf, &json)
        .expect("serialization of `serde_json::Value` into `BytesMut` cannot fail");

    // Build the HTTP request to fetch the DMs
    let mut request_builder = Request::builder()
        .method(method)
        .uri(format!("https://{server}/{path}"))
        .header("Connection", "close");

    log!(
        "requesting: {}, method: {}",
        format!("https://{server}/{path}"),
        method
    );

    for key in headers.keys() {
        let key = key.unwrap().as_string().unwrap();
        let val = headers
            .get(&JsValue::from_str(key.as_str()))
            .as_string()
            .unwrap();
        request_builder = request_builder.header(key, val);
    }

    let request = request_builder
        .body(match method {
            "POST" => Body::from(buf.into_inner().freeze()),
            _ => Body::empty(),
        })
        .unwrap();

    let response = request_sender.send_request(request).await.unwrap();
    if response.status() != StatusCode::OK {
        return format!("Error Status: {}", response.status().to_string());
    }

    // Pretty printing :)
    let payload = to_bytes(response.into_body()).await.unwrap().to_vec();

    // Close the connection to the server
    let mut client_socket = connection_receiver.await.unwrap().io.into_inner();
    client_socket.close().await.unwrap();

    return String::from_utf8_lossy(&payload).to_string();
}

#[wasm_bindgen]
pub async fn notarizeRequest(
    server: &str,
    path: &str,
    method: &str,
    data: &str,
    headers: js_sys::Map,
    keys_to_notarize: js_sys::Array,
    notary_url: &str,
    client_websocket_url: &str,
) -> String {
    // Basic default prover config
    let config = ProverConfig::builder()
        .id("example")
        .server_dns(server)
        .build()
        .unwrap();

    // Connect to the Notary
    let (_, notary_socket) = WsMeta::connect(notary_url, None)
        .await
        .expect_throw("assume the notary ws connection succeeds");

    post_update("Setting up 3 party TLS connection");

    // Create a Prover and set it up with the Notary
    // This will set up the MPC backend prior to connecting to the server.
    let prover = Prover::new(config)
        .setup(notary_socket.into_io())
        .await
        .unwrap();

    // Connect to the Server
    let (_, client_socket) = WsMeta::connect(client_websocket_url, None)
        .await
        .expect_throw("assume the client ws connection succeeds");

    // Bind the Prover to the sockets
    let (tls_connection, prover_fut) = prover.connect(client_socket.into_io()).await.unwrap();

    let (prover_sender, prover_receiver) = oneshot::channel();
    let handled_prover_fut = async {
        match prover_fut.await {
            Ok(prover_result) => {
                // Send the prover
                let _ = prover_sender.send(prover_result);
            }
            Err(err) => {
                panic!("An error occurred in prover_fut: {:?}", err);
            }
        }
    };
    spawn_local(handled_prover_fut);

    // Attach the hyper HTTP client to the TLS connection
    let (mut request_sender, connection) = hyper::client::conn::handshake(tls_connection.compat())
        .await
        .unwrap();

    let (connection_sender, connection_receiver) = oneshot::channel();
    let connection_fut = connection.without_shutdown();
    let handled_connection_fut = async {
        match connection_fut.await {
            Ok(connection_result) => {
                // Send the connection
                let _ = connection_sender.send(connection_result);
            }
            Err(err) => {
                panic!("An error occurred in connection_task: {:?}", err);
            }
        }
    };
    spawn_local(handled_connection_fut);

    let json: serde_json::Value = serde_json::from_str(data).expect("json wrong");
    let mut buf = BytesMut::new().writer();
    serde_json::to_writer(&mut buf, &json)
        .expect("serialization of `serde_json::Value` into `BytesMut` cannot fail");

    // Build the HTTP request to fetch the DMs
    let mut request_builder = Request::builder()
        .method(method)
        .uri(format!("https://{server}/{path}"))
        .header("Connection", "close");

    for key in headers.keys() {
        let key = key.unwrap().as_string().unwrap();
        let val = headers
            .get(&JsValue::from_str(key.as_str()))
            .as_string()
            .unwrap();
        request_builder = request_builder.header(key, val);
    }

    let request = request_builder
        .body(match method {
            "POST" => Body::from(buf.into_inner().freeze()),
            _ => Body::empty(),
        })
        .unwrap();

    post_update(format!("Start notarizing request to {server}").as_str());

    let response = request_sender.send_request(request).await.unwrap();

    post_update(format!("Received response from {server}").as_str());

    if response.status() != StatusCode::OK {
        return format!("Error Status: {}", response.status().to_string());
    }

    post_update("Request OK");

    // Pretty printing :)
    let payload = to_bytes(response.into_body()).await.unwrap().to_vec();
    let parsed =
        serde_json::from_str::<serde_json::Value>(&String::from_utf8_lossy(&payload)).unwrap();

    // Close the connection to the server
    let mut client_socket = connection_receiver.await.unwrap().io.into_inner();
    client_socket.close().await.unwrap();

    // The Prover task should be done now, so we can grab it.
    // let mut prover = prover_task.await.unwrap().unwrap();
    let prover = prover_receiver.await.unwrap();
    let mut prover = prover.start_notarize();
    post_update("Notarization of encrypted TLS transcripts done");

    let mut range_count = 0;

    post_update(format!("Generating commitments of part of the request header to prove the response was from {server} and the correct API endpoint").as_str());
    // Identify the ranges in the transcript that contain secrets
    let public_ranges_sent = find_ranges_include(
        prover.sent_transcript().data(),
        &[format!("{method} https://{server}/{path}").as_bytes()],
    );
    // Commit to the outbound transcript, isolating the data that contain secrets
    for range in public_ranges_sent.iter() {
        prover.add_commitment_sent(range.clone()).unwrap();
        range_count += 1;
    }

    post_update("Generating commitments of selected parts of the response");
    // Commit to selected portions of received transcript based on given keys
    for key_array in keys_to_notarize {
        let res_section =
            find_substring_with_keys(&parsed, js_sys::Array::from(&key_array).to_vec());
        if res_section == "" {
            continue;
        }
        let public_ranges_recv =
            find_ranges_include(prover.recv_transcript().data(), &[res_section.as_bytes()]);
        // Commit to the outbound transcript, isolating the data that contain secrets
        for range in public_ranges_recv.iter() {
            prover.add_commitment_recv(range.clone()).unwrap();
            range_count += 1;
        }
    }

    // Finalize, returning the notarized session
    let notarized_session: tlsn_core::NotarizedSession = prover.finalize().await.unwrap();

    post_update("Notarization complete!");

    let substrings_proof = notarized_session
        .generate_substring_proof((0..range_count).collect())
        .unwrap();
    let session_proof = notarized_session.session_proof();

    return [
        serde_json::to_string_pretty(&session_proof).unwrap(),
        serde_json::to_string_pretty(&substrings_proof).unwrap(),
    ]
    .join("|||||");
}
