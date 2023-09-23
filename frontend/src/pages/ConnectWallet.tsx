import { useState } from 'react'
import Web3Modal from "web3modal";
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import * as encoding from "@walletconnect/encoding";
import { getProviderInfo } from "web3modal"
import { ethers } from 'ethers';
import {
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  IconButton,
  Box,
} from '@mui/material';
import VerticalLinearStepper from '../components/stepper/VerticalLinearStepper';
import Iconify from '../components/iconify/Iconify';
import * as apis from '../utils/apirequests.js'
import metamaskImg from '../images/metamask.png'
import walletconnectImg from '../images/walletconnect.svg'
import { CustomAvatar } from '../components/custom-avatar';
import { useSnackbar } from '../components/snackbar';
import useCheckMobileScreen from '../hooks/useCheckMobileScreen';

const projectId = "68356ccffc405fa76490532f6ad56492";

const providerOptions = {
}
const web3Modal = new Web3Modal({
  network: "mainnet",
  cacheProvider: false,
  providerOptions
})

function ConnectWallet({ chainId, onWalletConnected, sx = {}, disabled = false, child = null }) {
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const [provider, setProvider] = useState(null);
  const [ethereumProvider, setEthereumProvider] = useState(null);
  const [connectingAddress, setConnectingAddress] = useState(null);

  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useCheckMobileScreen()

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false)
    setConnecting(false)
    setActiveStep(null)
  };

  // Mechanism to force metamask get user to select a wallet every time and not by default reuse the last one used
  const reconnectEvmWallet = async () => {
    // @ts-ignore
    await ethereum.request({
      method: 'wallet_requestPermissions',
      params: [{
        eth_accounts: {},
      }]
    });
    // @ts-ignore
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    return accounts && accounts.length > 0 ? accounts[0] : ""
  }

  // Get a challenge from backend for verifying wallet ownership
  const getNonce = async (chainId, walletAddress) => {
    const jsonData = await apis.backendRequest("get_wallet_nonce", {
      "chain_id": chainId,
      "wallet_address": walletAddress,
    });

    return jsonData
  };

  const getSession = async (chainId, walletAddress, signature) => {
    const jsonData = await apis.backendRequest("get_wallet_session", {
      "chain_id": chainId,
      "wallet_address": walletAddress,
      "signature": signature,
    });

    return jsonData
  };

  async function connectEvmWalletWalletConnect() {
    setActiveStep(0)

    const provider = await EthereumProvider.init({
      projectId: projectId, // REQUIRED your projectId
      chains: [1], // REQUIRED chain ids
      showQrModal: true, // REQUIRED set to "true" to use @walletconnect/modal
      methods: [], // REQUIRED ethereum methods
      optionalMethods: ['personal_sign'],
      events: [], // REQUIRED ethereum events
    })
    await provider.connect()

    const ethersProvider = new ethers.providers.Web3Provider(provider)
    const signer = ethersProvider.getSigner()
    const address = (await signer.getAddress()).toLowerCase()

    // Move active step to next
    setEthereumProvider(provider)
    setProvider(ethersProvider)
    setConnectingAddress(address)

    if (!isMobile) {
      await signMessageToGetSession(ethersProvider, provider, address)
    } else {
      setActiveStep(1)
    }
  }

  // Master function for connecting a new wallet to an account
  const connectEvmWallet = async () => {
    setActiveStep(0)

    // 1. Connect a wallet and get address from the providers
    if (web3Modal.cachedProvider) {
      // Clear the user provider so user can select a new one
      web3Modal.clearCachedProvider()
    }

    var existing_permissions = []
    // @ts-ignore
    if (typeof window.ethereum !== 'undefined') {
      // @ts-ignore
      existing_permissions = await ethereum.request({ method: 'wallet_getPermissions' });
    }

    const wallet = await web3Modal.connect()

    const provider = new ethers.providers.Web3Provider(wallet)
    var address = ""
    const signer = provider.getSigner()
    address = await signer.getAddress()

    if (getProviderInfo(wallet).id === "injected" && existing_permissions.length > 0) {
      address = await reconnectEvmWallet()
    }
    address = address.toLowerCase()

    // Move active step to next
    await signMessageToGetSession(provider, null, address)
  }

  const signMessageToGetSession = async function (provider, ethereumProvider, address) {
    setActiveStep(1)

    // 2. Get a nonce from backend and sign the nonce
    const walletNonce = await getNonce("evm", address)

    const msg = `Sign this message to verify ownership of ${address}, nonce: ${walletNonce?.nonce}`

    const hexMsg = encoding.utf8ToHex(msg, true);
    const walletSignature = await provider.send("personal_sign", [hexMsg, address])

    if (!walletSignature) {
      enqueueSnackbar("Signature verification failed.", { variant: "warning" })
      setActiveStep(1)
      return
    }

    setConnectingAddress(null)
    setProvider(null)
    if (ethereumProvider) {
      ethereumProvider.disconnect()
      setEthereumProvider(null)
    }

    // TODO: handle walletSignature on backend and get back session id
    const session = await getSession("evm", address, walletSignature)
    if (!session || !session.session_id) {
      enqueueSnackbar("Signature verification failed.", { variant: "warning" })
      setActiveStep(1)
      return
    }

    handleClose()
    enqueueSnackbar("Wallet successfully connected!", { variant: "success" })
    onWalletConnected(address, session.session_id)
  }

  const connectNewWallet = async function () {
    setConnecting(true)
    try {
      if (!chainId || chainId === "evm") {
        await connectEvmWallet()
      } else {
        console.log("Not supported yet")
      }
    } catch (error) {
      setActiveStep(null)
    }
    setConnecting(false)
  }

  const connectNewWalletWalletConnect = async function () {
    setOpen(true)
    setConnecting(true)
    try {
      if (!chainId || chainId === "evm") {
        await connectEvmWalletWalletConnect()
      } else {
        console.log("Not supported yet")
      }
    } catch (error) {
      console.log(error)
      setActiveStep(0)
    }
  }

  const STEPS = {
    stepIds: ['connet_wallet', 'verify_signature'],
    stepDetails: {
      'connet_wallet': {
        stepIdx: 0,
        label: 'Connect your wallet using Metamask or WalletConnect. No permission will be requested.',
        description: ``,
      },
      'verify_signature': {
        stepIdx: 1,
        label: 'Verify ownership of wallet by signing a sign-in message.',
        description: ``,
      },
    }
  };

  const renderStepLabel = function (step) {
    const label = STEPS.stepDetails[step].label
    return (
      <>
        {label}
      </>
    )
  }

  const renderStepContent = function (step, setActiveStep) {
    const description = STEPS.stepDetails[step].description

    return (
      <>
        <Typography>{description}</Typography>
      </>
    )
  }

  const renderResetContent = function (step) {
    return (
      <>
        <Typography>Address Connected!</Typography>
      </>
    )
  }

  return (
    <>
      {!child &&
        <Button sx={sx} variant="contained" onClick={() => {
          if (isMobile) {
            connectNewWalletWalletConnect()
          } else {
            handleClickOpen()
          }
        }} startIcon={(<Iconify icon="mdi:wallet-add-outline" />)} disabled={disabled}>
          Connect another wallet
        </Button>
      }
      {child &&
        <Box sx={sx} onClick={() => {
          if (isMobile) {
            connectNewWalletWalletConnect()
          } else {
            handleClickOpen()
          }
        }}>
          {child}
        </Box>
      }

      <Dialog open={open} onClose={handleClose} sx={{ zIndex: 69 }}>
        {!connecting && <DialogTitle sx={{
          maxWidth: "450px",
          minWidth: "300px",
        }}>Connect to RealReturn
        </DialogTitle>}
        {connecting && <DialogTitle sx={{
          maxWidth: "450px",
          minWidth: "300px",
        }}>Connect Wallet
        </DialogTitle>}
        <Stack
          direction={"column"}
          alignItems={"center"}
          marginLeft={"24px"}
          marginRight={"24px"}
          marginBottom={"24px"}
          spacing={6}>

          {connecting &&
            <Stack gap={2} alignItems="flex-end">
              <VerticalLinearStepper
                sx={{
                  textAlign: "left",
                  maxWidth: "450px",
                  minWidth: "300px",
                }}
                steps={STEPS.stepIds}
                parentActiveStep={activeStep}
                renderStepLabel={renderStepLabel}
                renderStepContent={renderStepContent}
                showReset={true}
                renderResetContent={renderResetContent}
              />
              <Stack direction={"row"} gap={1}>
                {activeStep === 0 && <Button
                  variant='outlined'
                  color='primary'
                  sx={{ height: "30px", width: "100px" }}
                  onClick={() => {
                    setConnecting(false)
                  }}>Cancel</Button>
                }
                {isMobile && activeStep === 1 && <Button
                  variant='contained'
                  color='primary'
                  sx={{ height: "30px", width: "150px" }}
                  onClick={() => {
                    signMessageToGetSession(provider, ethereumProvider, connectingAddress)
                  }}>Sign Message</Button>
                }
              </Stack>
            </Stack>
          }
          {!connecting &&
            <Stack direction={"row"} gap={4} alignItems="center" sx={{ marginTop: "12px" }}>
              {!isMobile &&
                <IconButton sx={{ width: "85px", height: "85px" }} onClick={() => connectNewWallet()}>
                  <CustomAvatar sx={{ width: "80px", height: "80px" }} alt="Metamask" src={metamaskImg} />
                </IconButton>
              }
              <IconButton sx={{ width: "85px", height: "85px" }} onClick={() => connectNewWalletWalletConnect()}>
                <CustomAvatar sx={{ width: "80px", height: "80px" }} alt="WalletConnect" src={walletconnectImg} />
              </IconButton>
            </Stack>
          }
        </Stack>

      </Dialog>
    </>
  )
}

export default ConnectWallet