import { useEffect, useState, useRef } from 'react'

// @mui
import { ToggleButtonGroup, ToggleButton, Typography, Stack, Tooltip, Button, IconButton, Box, Collapse, Avatar } from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

// Components
import { CustomAvatar } from '../components/custom-avatar';
import Iconify from '../components/iconify';

// @ts-ignore
import { useUserContext } from '../context/UserContext.tsx';
import ConnectWallet from './ConnectWallet'
import * as apirequests from '../utils/apirequests'
import robinhoodImg from '../images/robinhood.png'
import jomoImg from '../images/jomo.png'
import ethereumImg from '../images/ethereum.png'
import redditImg from '../images/reddit.png'
import twitterxImg from '../images/twitterx.png'
import googleImg from '../images/google.png'

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(2.5),
  backgroundColor: alpha(theme.palette.grey[800], 1),
  borderRadius: 10,
  maxWidth: 450,
  width: "100%",
}));

export default function Prove() {
  const { setPage } = useUserContext()
  const theme = useTheme()
  const isFirstMount = useRef(true)

  const [accountType, setAccountType] = useState(null)
  const [account, setAccount] = useState(null)
  const [proveSession, setProveSession] = useState(null)
  const [proving, setProving] = useState(false)
  const [proved, setProved] = useState(false)
  const [provedData, setProvedData] = useState(null)
  const [shareError, setShareError] = useState(null)

  const timespanToStr = {
    "0": "Weekly",
    "1": "Monthly",
    "2": "Yearly",
  }

  const brokerageToStr = {
    "0": "Robinhood",
  }

  const brokerageToImg = {
    "0": robinhoodImg,
  }

  const attesterToStr = {
    "0xae85c77f7318bdd466885d21e0875a40ec3657d2": "Jomo"
  }

  const attesterToImg = {
    "0xae85c77f7318bdd466885d21e0875a40ec3657d2": jomoImg
  }

  const waitForProveCallback = async function (sessionId) {
    setProved(false)
    setProving(true)

    const jsonData = await apirequests.backendRequest("get_session_result", {
      "session_id": sessionId,
    });
    setProving(false)

    if (jsonData) {
      setProved(true)
      setProvedData(jsonData.result)
    }
  }

  const startProve = async function (sessionId) {
    waitForProveCallback(sessionId)
    window.open(`${process.env.REACT_APP_JOMO_URL}/prove?flowid=105&publicaccountid=${sessionId}`, 'Jomo', 'resizable,height=800,width=600');
  }

  const shareToLeaderboard = async function (sessionId, accountType, account) {
    const jsonData = await apirequests.backendRequest("share_to_leaderboard", {
      "session_id": sessionId,
      "account_type": accountType,
      "account": account,
    });

    if (jsonData && jsonData.shared) {
      window.location.href = "/"
    } else if (jsonData) {
      setShareError(jsonData.error)
    } else {
      setShareError("Something went wrong.")
    }
  }

  // Whenever page loads, run first mount operations
  useEffect(() => {
    setPage("Prove")
    if (isFirstMount.current) {
      isFirstMount.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Stack marginTop={"35px"} alignItems={"center"} gap={3} minWidth={"540px"} marginX={"15px"} width={1}>
        <Stack gap={1} alignItems={"center"} textAlign={"center"} width={"450px"}>
          <Stack direction={"row"} alignItems={"center"} gap={1}>
            <Iconify height={28} width={28} icon="ic:round-leaderboard" />
            <Typography variant='h5'>Real Investment Returns</Typography>
          </Stack>
          <Typography variant='body2'>Prove your investment returns below and join the leaderboard!</Typography>
        </Stack>
        <Item sx={{ width: 1 }}>
          <Stack gap={2}>
            <Stack direction={"row"} gap={2} alignItems={"center"}>
              <Stack minHeight={36} minWidth={36} borderRadius={5} border={"1px solid"} alignItems={"center"} justifyContent={"center"}>
                {account &&
                  <Iconify height={20} width={20} icon="material-symbols:check" />
                }
                {!account &&
                  <Iconify height={20} width={20} icon="ri:number-1" />
                }
              </Stack>
              <Typography variant="body1" textAlign="left">
                Log in to RealReturn
              </Typography>
            </Stack>
            <Stack gap={0} alignItems={"center"} paddingLeft={2}>
              <Collapse in={account && true}>
                <Stack direction={"row"} justifyContent={"start"} alignItems={"center"} gap={1}>
                  {accountType && accountType === "evm" &&
                    <CustomAvatar sx={{ width: "30px", height: "30px" }} alt="EVM wallet" src={ethereumImg} />
                  }
                  <Typography>{account}</Typography>
                </Stack>
              </Collapse>
              <Collapse in={!account && true}>
                <Stack direction={"row"} justifyContent={"start"} alignItems={"center"} gap={2}>
                  <ConnectWallet
                    chainId={"evm"}
                    child={(
                      <IconButton sx={{ width: "45px", height: "45px" }}>
                        <CustomAvatar sx={{ width: "40px", height: "40px" }} alt="EVM wallet" src={ethereumImg} />
                      </IconButton>
                    )}
                    onWalletConnected={(address, session_id) => {
                      setAccountType("evm")
                      setAccount(address)
                      setProveSession(session_id)
                    }}
                  />
                  <Tooltip title="Coming Soon!" placement='top'>
                    <Box>
                      <Box
                        sx={{
                          backgroundColor: alpha(theme.palette.grey[800], 0.7), zIndex: 10
                        }} width={"45px"} height={"45px"} position={"absolute"} />
                      <IconButton sx={{ width: "45px", height: "45px" }} onClick={() => { }} disabled={true}>
                        <CustomAvatar sx={{ width: "40px", height: "40px" }} alt="Reddit" src={redditImg} />
                      </IconButton>
                    </Box>
                  </Tooltip>
                  <Tooltip title="Coming Soon!" placement='top'>
                    <Box>
                      <Box
                        sx={{
                          backgroundColor: alpha(theme.palette.grey[800], 0.7), zIndex: 10
                        }} width={"45px"} height={"45px"} position={"absolute"} />
                      <IconButton sx={{ width: "45px", height: "45px" }} onClick={() => { }} disabled={true}>
                        <CustomAvatar sx={{ width: "40px", height: "40px" }} alt="Twitter" src={twitterxImg} />
                      </IconButton>
                    </Box>
                  </Tooltip>
                  <Tooltip title="Coming Soon!" placement='top'>
                    <Box>
                      <Box
                        sx={{
                          backgroundColor: alpha(theme.palette.grey[800], 0.7), zIndex: 10
                        }} width={"45px"} height={"45px"} position={"absolute"} />
                      <IconButton sx={{ width: "45px", height: "45px" }} onClick={() => { }} disabled={true}>
                        <CustomAvatar sx={{ width: "40px", height: "40px" }} alt="Gmail" src={googleImg} />
                      </IconButton>
                    </Box>
                  </Tooltip>
                </Stack>
              </Collapse>
            </Stack>
          </Stack>
        </Item >
        <Item sx={{ width: 1 }}>
          <Stack gap={2}>
            <Stack direction={"row"} gap={2} alignItems={"center"}>
              <Stack minHeight={36} minWidth={36} borderRadius={5} border={"1px solid"} alignItems={"center"} justifyContent={"center"}>
                <Iconify height={20} width={20} icon="ri:number-2" />
              </Stack>
              <Typography variant="body1" textAlign="left">
                Prove your returns
              </Typography>
            </Stack>
            <Stack gap={2} alignItems={"center"}>
              <Stack direction={"row"} alignItems={"center"} gap={2}>
                <Typography variant='subtitle2'>Brokerage</Typography>
                <ToggleButtonGroup
                  color="primary"
                  size="small"
                  aria-label="Time Span"
                  value="robinhood"
                  exclusive
                  onChange={(_, newValue) => { }}
                >
                  <ToggleButton value="robinhood">
                    <Stack direction={"row"} alignItems={"center"} gap={1}>
                      <CustomAvatar sx={{ width: "20px", height: "20px" }} alt="EVM wallet" src={robinhoodImg} />
                      <Typography variant='subtitle2'>Robinhood</Typography>
                    </Stack>
                  </ToggleButton>
                  <ToggleButton value="other" disabled={true}>Coming Soon</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
              <Button
                variant='contained'
                disabled={!proveSession || proving || proved}
                onClick={() => { startProve(proveSession) }}
                startIcon={(
                  (proving && <Iconify height={20} width={20} icon="line-md:loading-loop" />) ||
                  (proved && <Iconify height={20} width={20} icon="material-symbols:check" />) ||
                  <CustomAvatar sx={{ width: "20px", height: "20px" }} alt="EVM wallet" src={jomoImg} />
                )}
              >
                Prove using Jomo
              </Button>
            </Stack>
            {provedData &&
              <Stack gap={1} alignItems={"left"} paddingX={5} width={1}>
                <Stack direction="row" spacing={1} alignItems='center'>
                  <Avatar alt={brokerageToImg[provedData.result_values[0]]} src={brokerageToImg[provedData.result_values[0]]} sx={{ width: 24, height: 24 }} />
                  <Typography gutterBottom variant="h6" component="div">
                    {brokerageToStr[provedData.result_values[0]]}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems='center' justifyContent={"space-between"}>
                  <Typography variant="subtitle2">
                    Unique Id
                  </Typography>
                  <Typography variant="body2">{provedData.unique_id}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems='center' justifyContent={"space-between"}>
                  <Typography variant="subtitle2">
                    Time Span
                  </Typography>
                  <Typography variant="body2">{timespanToStr[provedData.result_values[1]]}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems='center' justifyContent={"space-between"}>
                  <Typography variant="subtitle2">
                    Investment Return
                  </Typography>
                  <Typography variant="body2" color={(provedData.result_values[2] === "0" && provedData.result_values[3] !== "0") ? "text.stockdown" : "text.stockup"}>
                    {(provedData.result_values[2] === "0" && provedData.result_values[3] !== "0") ? "Down" : "Up"} {parseFloat(provedData.result_values[2] === "0" ? provedData.result_values[3] : provedData.result_values[2]) / 100.0}%
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems='center' justifyContent={"space-between"}>
                  <Typography variant="subtitle2">
                    Proved By
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems='center'>
                    <Avatar alt={attesterToStr[provedData.attester]} src={attesterToImg[provedData.attester]} sx={{ width: 20, height: 20 }} />
                    <Typography gutterBottom variant="subtitle2">
                      {attesterToStr[provedData.attester]}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            }
          </Stack>
        </Item>
        <Item sx={{ width: 1 }}>
          <Stack gap={2}>
            <Stack direction={"row"} gap={2} alignItems={"center"}>
              <Stack minHeight={36} minWidth={36} borderRadius={5} border={"1px solid"} alignItems={"center"} justifyContent={"center"}>
                <Iconify height={20} width={20} icon="ri:number-3" />
              </Stack>
              <Typography variant="body1" textAlign="left">
                Share to leaderboard
              </Typography>
            </Stack>
            <Stack gap={2} alignItems={"center"}>
              {shareError &&
                <Typography variant='body1'>{shareError}</Typography>
              }
              <Button
                variant='contained'
                disabled={!proved}
                onClick={() => { shareToLeaderboard(provedData.session_id, accountType, account) }}
              >
                Share on RealReturn
              </Button>
            </Stack>
          </Stack>
        </Item>
      </Stack >
    </>
  );
}
