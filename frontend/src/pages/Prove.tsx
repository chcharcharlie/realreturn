import { useEffect, useState, useRef } from 'react'

// @mui
import { ToggleButtonGroup, ToggleButton, Typography, Stack, Tooltip, Button, IconButton, Box, Collapse } from '@mui/material';
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

  const waitForProveCallback = async function (sessionId) {
    setProved(false)
    setProving(true)

    const jsonData = await apirequests.backendRequest("get_session_result", {
      "session_id": sessionId,
    });
    setProving(false)

    if (jsonData) {
      setProved(true)

      // TODO: Handle data, link it to account and join leaderboard
    }
  }

  const startProve = async function (sessionId) {
    waitForProveCallback(sessionId)
    window.open(`http://localhost:3000/prove?flowid=106&publicaccountid=${sessionId}`, 'Jomo', 'resizable,height=800,width=600');
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
                        <CustomAvatar sx={{ width: "40px", height: "40px" }} alt="EVM wallet" src={redditImg} />
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
                        <CustomAvatar sx={{ width: "40px", height: "40px" }} alt="EVM wallet" src={twitterxImg} />
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
                        <CustomAvatar sx={{ width: "40px", height: "40px" }} alt="EVM wallet" src={googleImg} />
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
          </Stack>
        </Item>
      </Stack >
    </>
  );
}
