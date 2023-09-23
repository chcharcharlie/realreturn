import { useEffect, useState } from 'react'
// @mui
import { ToggleButtonGroup, ToggleButton, Typography, Stack, Tooltip } from '@mui/material';
import { CustomAvatarGroup, CustomAvatar } from '../components/custom-avatar';

// @ts-ignore
import { useUserContext } from '../context/UserContext.tsx';
import robinhoodImg from '../images/robinhood.png'
import jomoImg from '../images/jomo.png'

export default function Home() {
  const { setPage } = useUserContext()
  const [timespan, setTimespan] = useState("week")
  const [gainloss, setGainloss] = useState("positive")

  // Whenever page loads, load locally stored data
  useEffect(() => {
    setPage("Home")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Stack marginTop={"25px"} alignItems={"center"} gap={2} minWidth={"540px"} marginX={"15px"}>
        <Typography variant='h4'>Verified Investment Return Leaderboard</Typography>
        <Stack direction={"row"} justifyContent={"space-evenly"} width={1}>
          <ToggleButtonGroup
            color="primary"
            size="small"
            aria-label="Time Span"
            value={timespan}
            exclusive
            onChange={(_, newValue) => { setTimespan(newValue) }}
          >
            <ToggleButton value="week">Weekly</ToggleButton>
            <ToggleButton value="month">Monthly</ToggleButton>
            <ToggleButton value="year">Yearly</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup
            color="primary"
            size="small"
            aria-label="Gain or Loss"
            value={gainloss}
            exclusive
            onChange={(_, newValue) => { setGainloss(newValue) }}
          >
            <ToggleButton value="positive" color='success'>Biggest Gain</ToggleButton>
            <ToggleButton value="negative" color='error'>Biggest Loss</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Stack width={"400px"} gap={0.5}>
          <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} width={1}>
            <Stack direction={"row"} gap={2} alignItems={"center"}>
              <Typography variant='h6' minWidth={"20px"}>1</Typography>
              <Typography variant='body1' minWidth={"150px"}>0x1234efgh....uiop</Typography>
              <Tooltip title={"Brokerage ( Robinhood ) - Attested by ( Jomo )"} placement="top">
                <CustomAvatarGroup size={"tiny"} spacing={"medium"}>
                  <CustomAvatar
                    alt={"Robinhood"}
                    src={robinhoodImg}
                  />
                  <CustomAvatar
                    alt="Jomo"
                    src={jomoImg}
                  />
                </CustomAvatarGroup>
              </Tooltip>
            </Stack>
            <Typography variant='h6' color={"success.main"}>+54.15%</Typography>
          </Stack>
          <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} width={1}>
            <Stack direction={"row"} gap={2} alignItems={"center"}>
              <Typography variant='h6' minWidth={"20px"}>2</Typography>
              <Typography variant='body1'>0x1234efgh....uiop</Typography>
            </Stack>
            <Typography variant='h6'>+52.09%</Typography>
          </Stack>
          <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} width={1}>
            <Stack direction={"row"} gap={2} alignItems={"center"}>
              <Typography variant='h6' minWidth={"20px"}>22</Typography>
              <Typography variant='body1'>0x1234efgh....uiop</Typography>
            </Stack>
            <Typography variant='h6'>+45.09%</Typography>
          </Stack>
        </Stack>
      </Stack>
    </>
  );
}
