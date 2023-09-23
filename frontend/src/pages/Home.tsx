import { useEffect, useState, useRef } from 'react'
// @mui
import { ToggleButtonGroup, ToggleButton, Typography, Stack, Tooltip, CircularProgress, Button } from '@mui/material';
import { CustomAvatarGroup, CustomAvatar } from '../components/custom-avatar';

// @ts-ignore
import { useUserContext } from '../context/UserContext.tsx';
import * as apirequests from '../utils/apirequests'
import robinhoodImg from '../images/robinhood.png'
import jomoImg from '../images/jomo.png'

export default function Home() {
  const { setPage } = useUserContext()
  const [timespan, setTimespan] = useState("week")
  const [gainloss, setGainloss] = useState("positive")
  const [loaded, setLoaded] = useState(false)
  const [data, setData] = useState([])
  const isFirstMount = useRef(true)

  const loadData = async function (time_span, gain_or_loss, max_records) {
    setLoaded(false)

    const dataResponse = await apirequests.backendRequest("get_leaderboard_data", {
      "time_span": time_span,
      "gain_or_loss": gain_or_loss,
      "max_records": max_records
    })
    setData(dataResponse["data"])

    setLoaded(true)
  }

  // Whenever page loads, load locally stored data
  useEffect(() => {
    setPage("Home")
    if (isFirstMount.current) {
      isFirstMount.current = false
      loadData("week", "positive", 50)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Stack marginTop={"35px"} alignItems={"center"} gap={2} minWidth={"540px"} marginX={"15px"}>
        <Stack gap={0.5}>
          <Typography variant='h5'>Attested Investment Return Leaderboard</Typography>
          <Button onClick={() => { window.location.href = "/prove" }}>Join the Leaderboard</Button>
        </Stack>
        <Stack direction={"row"} justifyContent={"space-evenly"} width={1}>
          <ToggleButtonGroup
            color="primary"
            size="small"
            aria-label="Time Span"
            value={timespan}
            exclusive
            onChange={(_, newValue) => {
              setTimespan(newValue)
              loadData(newValue, gainloss, 50)
            }}
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
            onChange={(_, newValue) => {
              setGainloss(newValue)
              loadData(timespan, newValue, 50)
            }}
          >
            <ToggleButton value="positive" color='success'>Biggest Gains</ToggleButton>
            <ToggleButton value="negative" color='error'>Biggest Losses</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        {!loaded &&
          <Stack>
            <CircularProgress size={24} color="primary" />
          </Stack>
        }
        {loaded && data.length === 0 &&
          <Typography>No records yet</Typography>
        }
        {loaded &&
          <Stack width={"540px"} gap={0.5}>
            {data.map((record, idx) =>
              <Stack key={idx} direction={"row"} justifyContent={"space-between"} alignItems={"center"} width={1}>
                <Stack direction={"row"} gap={2} alignItems={"center"}>
                  <Typography variant='h6' minWidth={"20px"}>{idx + 1}</Typography>
                  <Typography variant='body1' minWidth={"150px"}>{record.user}</Typography>
                </Stack>
                <Stack direction={"row"} gap={2} alignItems={"center"}>
                  <Typography variant='h6' color={record.return_number >= 0 ? "success.main" : "error.main"} minWidth={"70px"}>
                    {record.return_number > 0 && "+"}{record.return_number / 100.00}%
                  </Typography>
                  <Tooltip title={`Brokerage ( ${record.brokerage} ) - Attested by ( ${record.attester} )`} placement="top">
                    <CustomAvatarGroup size={"tiny"} spacing={"medium"}>
                      <CustomAvatar
                        alt={record.brokerage}
                        src={
                          record.brokerage === 'Robinhood' && robinhoodImg
                        }
                      />
                      <CustomAvatar
                        alt={record.attester}
                        src={
                          record.attester === 'Jomo' && jomoImg
                        }
                      />
                    </CustomAvatarGroup>
                  </Tooltip>
                  <Tooltip title={`Attestation generated based on data from ${new Date(record.attested_at._seconds * 1000).toLocaleDateString()}`} placement="top">
                    <Typography variant='caption' minWidth={"65px"}>{new Date(record.attested_at._seconds * 1000).toLocaleDateString()}</Typography>
                  </Tooltip>
                </Stack>
              </Stack>
            )}
          </Stack>
        }
        <Button variant='contained' onClick={() => { window.location.href = "/prove" }}>Join the Leaderboard</Button>
      </Stack >
    </>
  );
}
