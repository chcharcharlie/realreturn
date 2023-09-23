import { useEffect, useState, useRef } from 'react'

// @mui
import { ToggleButtonGroup, ToggleButton, Typography, Stack, Tooltip, CircularProgress, Button, IconButton, Box } from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

// Components
import { CustomAvatarGroup, CustomAvatar } from '../components/custom-avatar';
import Iconify from '../components/iconify';

// @ts-ignore
import { useUserContext } from '../context/UserContext.tsx';
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
      <Stack marginTop={"35px"} alignItems={"center"} gap={2} minWidth={"540px"} marginX={"15px"} width={1}>
        <Stack gap={1} alignItems={"center"} textAlign={"center"} width={"450px"}>
          <Stack direction={"row"} alignItems={"center"} gap={1}>
            <Iconify height={28} width={28} icon="ic:round-leaderboard" />
            <Typography variant='h5'>Attested Investment Returns</Typography>
          </Stack>
          <Typography variant='body1'>Follow the steps below to prove your investment returns and join the leaderboard</Typography>
        </Stack>
        <Item sx={{ width: 1 }}>
          <Stack gap={2}>
            <Stack direction={"row"} gap={2} alignItems={"center"}>
              <Stack minHeight={36} minWidth={36} borderRadius={5} border={"1px solid"} alignItems={"center"} justifyContent={"center"}>
                <Iconify height={20} width={20} icon="ri:number-1" />
              </Stack>
              <Typography variant="body1" textAlign="left">
                Log in to RealReturn
              </Typography>
            </Stack>
            <Stack gap={1} alignItems={"center"} paddingLeft={1}>
              <Stack direction={"row"} justifyContent={"start"} alignItems={"center"} gap={2}>
                <IconButton sx={{ width: "45px", height: "45px" }} onClick={() => { }}>
                  <CustomAvatar sx={{ width: "40px", height: "40px" }} alt="EVM wallet" src={ethereumImg} />
                </IconButton>
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
            </Stack>
          </Stack>
        </Item >
      </Stack >
    </>
  );
}
