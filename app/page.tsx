"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Button as MuiButton,
  Slider as MuiSlider,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { DateRange } from "@mui/x-date-pickers-pro/models";

import axios from "axios";
import { ResponsiveLine } from "@nivo/line";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import { clsx } from "clsx";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { Marker, Popup, MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import L from "leaflet";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
// import { createStyles, makeStyles } from '@mui/system';
import { createTheme, makeStyles, createStyles } from "@mui/material/styles";
// import Chart from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

import { Line } from "react-chartjs-2";
import { Struct } from "next/dist/compiled/superstruct";

export default function Home() {
  const [chartData, setChartData] = useState<any>(null);
  const [liftingSettings, setLiftingSettings] = useState({
    amountOfWater: 0,
    liftingHeight: 0,
    timeOfDay: { start: 5, end: 11 },
  });
  const [distributionSettings, setDistributionSettings] = useState({
    areaOfDistribution: 0,
    depthOfDistribution: 0,
    timeOfDay: { start: 5, end: 11 },
  });
  const [pressureSettings, setPressureSettings] = useState({
    amountOfWater: 0,
    pressureRequired: 0,
    timeOfDay: { start: 5, end: 11 },
  });
  const [solarSettings, setSolarSettings] = useState({
    netAreaOfActiveSolarPanels: 0,
    solarPanelEfficiency: 0,
    timeOfDay: { start: 5, end: 11 },
  });
  const [timeResolution, setTimeResolution] = useState("hourly");
  const [timeRange, setTimeRange] = useState<DateRange<Dayjs>>([
    dayjs("2024-01-01"),
    dayjs("2024-01-05"),
  ]);
  const [zone, setZone] = useState("zone1");

  interface LiftingSettings {
    amountOfWater: number;
    liftingHeight: number;
    timeOfDay: { start: number; end: number };
  }

  interface DistributionSettings {
    areaOfDistribution: number;
    depthOfDistribution: number;
    timeOfDay: { start: number; end: number };
  }

  interface PressureSettings {
    amountOfWater: number;
    pressureRequired: number;
    timeOfDay: { start: number; end: number };
  }

  interface SolarSettings {
    netAreaOfActiveSolarPanels: number;
    solarPanelEfficiency: number;
    timeOfDay: { start: number; end: number };
  }

  const handleSettingsChange = (setting: string, value: any) => {
    // Update the appropriate state based on the setting
    switch (setting) {
      case "liftingSettings":
        setLiftingSettings(value as LiftingSettings);
        break;
      case "distributionSettings":
        setDistributionSettings(value as DistributionSettings);
        break;
      case "pressureSettings":
        setPressureSettings(value as PressureSettings);
        break;
      case "solarSettings":
        setSolarSettings(value as SolarSettings);
        break;
      default:
        break;
    }
  };
  //solar_panel_settings_area_of_distribution=4&solar_panel_settings_efficiency=5&si_units=false
  const handleSliderChange = (setting: string, newValue: number[]) => {
    if (Array.isArray(newValue)) {
      const [start, end] = newValue;
      handleSettingsChange(setting, {
        ...getSettingsFromString(setting),
        timeOfDay: { start, end },
      });
    }
  };

  const getSettingsFromString = (setting: string) => {
    switch (setting) {
      case "liftingSettings":
        return liftingSettings;
      case "distributionSettings":
        return distributionSettings;
      case "pressureSettings":
        return pressureSettings;
      case "solarSettings":
        return solarSettings;
      default:
        return {};
    }
  };
  const icon = L.icon({ iconUrl: "images/marker-icon.png" });
  useEffect(() => {
    handleApply();
  }, []);
  const handleApply = async () => {
    const API_URL =
      "https://ezp2dcwx4o2eaqnr4v67f65ofy0ckzpo.lambda-url.us-west-1.on.aws/predict?";
    try {
      const { data } = await axios.get(API_URL, {
        params: {
          zone: zone,
          start_time: timeRange[0]?.format("YYYY-MM-DD"),
          end_time: timeRange[1]?.format("YYYY-MM-DD"),
          time_scale: timeResolution,
          lifting_settings_water_amount: liftingSettings.amountOfWater,
          lifting_settings_lifting_height: liftingSettings.liftingHeight,
          lifting_settings_tod_start: liftingSettings.timeOfDay.start,
          lifting_settings_tod_end: liftingSettings.timeOfDay.end,
          distribution_settings_area_of_distribution:
            distributionSettings.areaOfDistribution,
          distribution_settings_depth_of_distribution:
            distributionSettings.areaOfDistribution,
          distribution_settings_tod_start: distributionSettings.timeOfDay.start,
          distribution_settings_tod_end: distributionSettings.timeOfDay.end,
          pressurization_settings_water_amount: pressureSettings.amountOfWater,
          pressurization_settings_pressurization_level:
            pressureSettings.pressureRequired,
          pressurization_settings_tod_start: pressureSettings.timeOfDay.start,
          pressurization_settings_tod_end: pressureSettings.timeOfDay.end,
          solar_panel_settings_area_of_distribution:
            solarSettings.netAreaOfActiveSolarPanels,
          solar_panel_settings_efficiency: solarSettings.solarPanelEfficiency,
          si_units: false,
        },
      });
      console.log(data.response);
      setChartData(data.response);
    } catch (e) {
      console.log(e);
    }
  };
  const total_demand = "123";

  // L.Marker.prototype.options.icon = DefaultIcon;
  return (
    <div className="bg-black text-white min-h-screen p-8 md:p-6 lg:p-8">
      <div className="inline-flex flex-col justify-center items-center gap-14 relative ml-3">
        <div className="inline-flex flex-col  gap-[50px] relative ml-4 ">
          <div className="text-white text-3xl ml-2 mt-2">Dashboard</div>
          <div className="inline-flex justify-center items-center gap-[30px] relative">
            <div className="flex flex-col w-[669px] h-[642px] items-start gap-[11px] relative">
              <div className="relative w-[669px] h-[448px] bg-black rounded-[20px] border border-solid border-[#b2b2b2] -mt-14">
                <MapContainer
                  center={[37.59, -120.84]}
                  zoom={5}
                  scrollWheelZoom={false}
                  style={{
                    padding: "10px",
                    height: "100%",
                    borderRadius: "20px",
                  }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker
                    position={[37.59, -120.84]}
                    icon={icon}
                    eventHandlers={{
                      click: () => {
                        setZone("zone1");
                      },
                    }}
                  >
                    <Popup>Hughson</Popup>
                  </Marker>
                  <Marker
                    position={[33.97, -117.33]}
                    icon={icon}
                    eventHandlers={{
                      click: () => {
                        setZone("zone2");
                      },
                    }}
                  >
                    <Popup>Riverside</Popup>
                  </Marker>
                  <Marker
                    position={[35.9, -119.1]}
                    icon={icon}
                    eventHandlers={{
                      click: () => {
                        setZone("zone3");
                      },
                    }}
                  >
                    <Popup>Terra Bella</Popup>
                  </Marker>
                </MapContainer>
              </div> 
              <div className="relative w-[669px] h-[183px] bg-black rounded-[15px] border border-solid border-[#bfbfbf] mt-10">
                {" "}
                <Card className="bg-black  rounded-lg">
                  <CardHeader>
                    <CardTitle className=" flex items-center justify-center text-center text-sm md:text-base text-white">
                      Resolution Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      row
                      aria-label="time-resolution"
                      name="time-resolution"
                      value={timeResolution}
                      onChange={(e) => setTimeResolution(e.target.value)}
                    >
                      <FormControlLabel
                        value="hourly"
                        control={<Radio />}
                        label="Hourly"
                        className="text-white"
                      />
                      <FormControlLabel
                        value="daily"
                        control={<Radio />}
                        label="Daily"
                        className="text-white"
                      />
                      <FormControlLabel
                        value="monthly"
                        control={<Radio />}
                        label="Monthly"
                        className="text-white"
                      />
                    </RadioGroup>
                    <div className="flex mb-4">
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={["DateRangePicker"]}>
                          <DateRangePicker
                            value={timeRange}
                            onChange={(newTimeRange) =>
                              setTimeRange(newTimeRange)
                            }
                            sx={{ backgroundColor: "white" }}
                          />
                        </DemoContainer>
                      </LocalizationProvider>
                      <div className="flex justify-between items-center">
                        <MuiButton
                          variant="contained"
                          color="primary"
                          onClick={handleApply}
                          className="text-white bg-blue-500 hover:bg-blue-600 text-xs md:text-sm ml-4"
                        >
                          APPLY
                        </MuiButton>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="flex flex-wrap w-[677px] items-start gap-[30px_30px] relative">
              <div className="relative w-[321px] h-[311px] bg-black rounded-[20px] border border-solid border-[#ffffffb2]">
                <Card className="bg-black ">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center text-sm md:text-base text-white">
                      DISTRIBUTION SETTINGS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label
                        htmlFor="solar-area"
                        className="text-sm md:text-base text-white"
                      >
                        Area of Distribution
                      </Label>
                      <div className="flex">
                        <Input
                          id="solar-area"
                          value={solarSettings.netAreaOfActiveSolarPanels}
                          onChange={(e) =>
                            handleSettingsChange("solarSettings", {
                              ...solarSettings,
                              netAreaOfActiveSolarPanels: Number(
                                e.target.value
                              ),
                            })
                          }
                          className="text-white bg-black w-4/5"
                        />
                        <div className="text-white ml-5 -mt-1 mb-3">
                          acres /<br /> hectare
                        </div>
                      </div>
                      <Label
                        htmlFor="solar-efficiency"
                        className="text-sm md:text-base text-white"
                      >
                        Depth of Distribution
                      </Label>
                      <div className="flex">
                        <Input
                          id="solar-efficiency"
                          value={solarSettings.solarPanelEfficiency}
                          onChange={(e) =>
                            handleSettingsChange("solarSettings", {
                              ...solarSettings,
                              solarPanelEfficiency: Number(e.target.value),
                            })
                          }
                          className="text-white bg-black w-4/5"
                        />
                        <div className="text-white ml-5 mt-2 mb-6">inches</div>
                      </div>
                      <Label
                        htmlFor="solar-time"
                        className="text-sm md:text-base text-white"
                      >
                        Time of Day
                      </Label>
                      <MuiSlider
                        value={[
                          solarSettings.timeOfDay.start,
                          solarSettings.timeOfDay.end,
                        ]}
                        onChange={(e, value) =>
                          handleSliderChange("solarSettings", value as number[])
                        }
                        min={0}
                        max={23}
                        marks={true}
                        step={3}
                        valueLabelDisplay="auto"
                        className="w-full"
                        sx={{
                          color: "#2196F3",
                          "& .MuiSlider-rail": {
                            color: "#2196F3",
                          },
                          "& .MuiSlider-track": {
                            color: "#2196F3",
                          },
                          "& .MuiSlider-thumb": {
                            color: "#2196F3",
                          },
                        }}
                      />
                      <div className="text-sm md:text-base text-white">
                        Default Time of Day
                      </div>
                      <div>
                        <input
                          type="checkbox"
                          id="toggleRadio"
                          style={{ appearance: "radio" }} // Makes the checkbox look like a radio button
                        />
                        <label
                          htmlFor="toggleRadio"
                          className=" text-white pl-2"
                        >
                          {" "}
                          9am to 4pm
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="relative w-[321px] h-[311px]  bg-black rounded-[20px]">
                <Card className="bg-black">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center text-sm md:text-base text-white">
                      LIFTING SETTINGS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label
                        htmlFor="pressure-water"
                        className="text-sm md:text-base text-white"
                      >
                        Amount of Water
                      </Label>
                      <div className="flex">
                        <Input
                          id="pressure-water"
                          value={pressureSettings.amountOfWater}
                          onChange={(e) =>
                            handleSettingsChange("pressureSettings", {
                              ...pressureSettings,
                              amountOfWater: Number(e.target.value),
                            })
                          }
                          className="text-white bg-black w-4/5"
                        />{" "}
                        <div className="text-white ml-5 mt-2 mb-6">ltrs.</div>
                      </div>
                      <Label
                        htmlFor="pressure-required"
                        className="text-sm md:text-base text-white"
                      >
                        Lifting Height
                      </Label>
                      <div className="flex">
                        <Input
                          id="pressure-required"
                          value={pressureSettings.pressureRequired}
                          onChange={(e) =>
                            handleSettingsChange("pressureSettings", {
                              ...pressureSettings,
                              pressureRequired: Number(e.target.value),
                            })
                          }
                          className="text-white bg-black w-4/5"
                        />
                        <div className="text-white ml-5 mt-2 mb-6">ft.</div>
                      </div>
                      <Label
                        htmlFor="pressure-time"
                        className="text-sm md:text-base text-white"
                      >
                        Time of Day
                      </Label>
                      <MuiSlider
                        value={[
                          pressureSettings.timeOfDay.start,
                          pressureSettings.timeOfDay.end,
                        ]}
                        onChange={(e, value) =>
                          handleSliderChange(
                            "pressureSettings",
                            value as number[]
                          )
                        }
                        min={0}
                        max={23}
                        marks={true}
                        step={3}
                        valueLabelDisplay="auto"
                        className="w-full"
                        sx={{
                          color: "#2196F3",
                          "& .MuiSlider-rail": {
                            color: "#2196F3",
                          },
                          "& .MuiSlider-track": {
                            color: "#2196F3",
                          },
                          "& .MuiSlider-thumb": {
                            color: "#2196F3",
                          },
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="relative w-[321px] h-[311px] bg-black rounded-[20px] border border-solid border-[#ffffffb2] mt-24">
                <Card className="bg-black ">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center text-sm md:text-base text-white">
                      PRESSURIZATION SETTINGS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label
                        htmlFor="distribution-area"
                        className="text-sm md:text-base text-white"
                      >
                        Amount of water
                      </Label>
                      <div className="flex">
                        <Input
                          id="distribution-area"
                          value={distributionSettings.areaOfDistribution}
                          onChange={(e) =>
                            handleSettingsChange("distributionSettings", {
                              ...distributionSettings,
                              areaOfDistribution: Number(e.target.value),
                            })
                          }
                          className="text-white bg-black w-4/5"
                        />
                        <div className="text-white ml-5 mt-2 mb-6">ltrs.</div>
                      </div>
                      <Label
                        htmlFor="distribution-depth"
                        className="text-sm md:text-base text-white"
                      >
                        Pressurization required
                      </Label>
                      <div className="flex">
                        <Input
                          id="distribution-depth"
                          value={distributionSettings.depthOfDistribution}
                          onChange={(e) =>
                            handleSettingsChange("distributionSettings", {
                              ...distributionSettings,
                              depthOfDistribution: Number(e.target.value),
                            })
                          }
                          className="text-white bg-black w-4/5"
                        />
                        <div className="text-white ml-5 mt-2 mb-6">ft.</div>
                      </div>
                      <Label
                        htmlFor="distribution-time"
                        className="text-sm md:text-base text-white"
                      >
                        Time of Day
                      </Label>
                      <MuiSlider
                        value={[
                          distributionSettings.timeOfDay.start,
                          distributionSettings.timeOfDay.end,
                        ]}
                        onChange={(e, value) =>
                          handleSliderChange(
                            "distributionSettings",
                            value as number[]
                          )
                        }
                        min={0}
                        max={23}
                        marks={true}
                        step={3}
                        valueLabelDisplay="auto"
                        className="w-full"
                        sx={{
                          color: "#2196F3",
                          "& .MuiSlider-rail": {
                            color: "#2196F3",
                          },
                          "& .MuiSlider-track": {
                            color: "#2196F3",
                          },
                          "& .MuiSlider-thumb": {
                            color: "#2196F3",
                          },
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="relative w-[321px] h-[311px] bg-black rounded-[20px] border border-solid border-[#ffffffb2] mt-8">
                <Card className="bg-black ">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center text-sm md:text-base text-white">
                      SOLAR PANEL SETTINGS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <input
                          type="radio"
                          id="option1"
                          name="radioOption"
                          value="Option 1"
                        />
                        <label htmlFor="option1">
                          <Label
                            htmlFor="amount-water"
                            className="text-sm md:text-base text-white pl-2"
                          >
                            Net Area of Active Solar Panels Needed
                          </Label>
                          <div className="flex">
                            <Input
                              id="amount-water"
                              value={liftingSettings.amountOfWater}
                              onChange={(e) =>
                                handleSettingsChange("liftingSettings", {
                                  ...liftingSettings,
                                  amountOfWater: Number(e.target.value),
                                })
                              }
                              className="text-white bg-black w-4/5"
                            ></Input>
                            <div className="text-white ml-5 mt-2 mb-6">m³</div>
                          </div>
                        </label>
                      </div>

                      <div>
                        <input
                          type="radio"
                          id="option2"
                          name="radioOption"
                          value="Option 2"
                        />
                        <label htmlFor="option2">
                          <Label
                            htmlFor="amount-water"
                            className="text-sm md:text-base text-white pl-2"
                          >
                            Net Area of Active Solar Panels Installed
                          </Label>
                          <div className="flex">
                            <Input
                              id="amount-water"
                              value={liftingSettings.amountOfWater}
                              onChange={(e) =>
                                handleSettingsChange("liftingSettings", {
                                  ...liftingSettings,
                                  amountOfWater: Number(e.target.value),
                                })
                              }
                              className="text-white bg-black w-4/5"
                            ></Input>
                            <div className="text-white ml-5 mt-2 mb-6">m³</div>
                          </div>
                        </label>
                      </div>

                      <Label
                        htmlFor="lifting-height"
                        className="text-sm md:text-base text-white"
                      >
                        Solar Panel Efficiency
                      </Label>
                      <div className="flex">
                        <Input
                          id="lifting-height"
                          value={liftingSettings.liftingHeight}
                          onChange={(e) =>
                            handleSettingsChange("liftingSettings", {
                              ...liftingSettings,
                              liftingHeight: Number(e.target.value),
                            })
                          }
                          className="text-white bg-black w-4/5"
                        />
                        <div className="text-white ml-5 mt-2">%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/*<div className="relative w-[321px] h-[311px] bg-black rounded-[20px] border border-solid border-[#ffffffb2] mt-8">
                <Card className="bg-black">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center text-sm md:text-base text-white mt-2.5">
                      SOLAR PANEL SETTINGS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <Label
                        htmlFor="amount-water"
                        className="text-sm md:text-base text-white"
                      >
                        Net Area of Active Solar Panels
                      </Label>
                      <div className="flex">
                        <Input
                          id="amount-water"
                          value={liftingSettings.amountOfWater}
                          onChange={(e) =>
                            handleSettingsChange("liftingSettings", {
                              ...liftingSettings,
                              amountOfWater: Number(e.target.value),
                            })
                          }
                          className="text-white bg-black w-4/5"
                        ></Input>
                        <div className="text-white ml-5 mt-2">m³</div>
                      </div>

                      <Label
                        htmlFor="lifting-height"
                        className="text-sm md:text-base text-white"
                      >
                        Solar Panel Efficiency
                      </Label>
                      <div className="flex">
                        <Input
                          id="lifting-height"
                          value={liftingSettings.liftingHeight}
                          onChange={(e) =>
                            handleSettingsChange("liftingSettings", {
                              ...liftingSettings,
                              liftingHeight: Number(e.target.value),
                            })
                          }
                          className="text-white bg-black w-4/5"
                        />
                        <div className="text-white ml-5 mt-2">%</div>
                      </div>
                      <div className="mt-80"></div>
                    </div>
                  </CardContent>
                </Card>
              </div> */} 
            </div>
          </div>

          <div className="inline-flex flex-col items-start gap-[19px] relative flex-[0_0_auto] mt-10">
            <div className="inline-flex items-start gap-[18px] relative flex-[0_0_auto]">
              <div className="relative w-[450px] h-[299px] bg-black rounded-[13.94px] ">
                <Card className="p-2 bg-black rounded-lg border border-white">
                  <div className="flex">
                    <div className="text-white mb-3">Power Demand</div>
                    <div className="text-white ml-auto font-bold underline">
                      Total Demand : {total_demand} kwh
                    </div>
                  </div>
                  {chartData && (
                    <LineChart
                      className="w-full h-[150px] md:h-[200px] lg:h-[250px]"
                      graph_data={chartData}
                      graph_title="power_demand"
                    />
                  )}
                </Card>
              </div>
              <div className="relative w-[450px] h-[299px] bg-black rounded-[13.94px] ">
                <Card className="p-2 bg-black rounded-lg border border-white">
                  <div className="text-white mb-3">Solar Radiation</div>
                  {chartData && (
                    <LineChart
                      className="w-full h-[150px] md:h-[200px] lg:h-[250px]"
                      graph_data={chartData}
                      graph_title="solar_radiation"
                    />
                  )}
                </Card>
              </div>
              <div className="relative w-[450px] h-[299px] bg-black rounded-[13.94px] ">
                <Card className="p-2 bg-black rounded-lg border border-white">
                  <div className="text-white mb-3">Clouds</div>
                  {chartData && (
                    <LineChart
                      className="w-full h-[150px] md:h-[200px] lg:h-[250px]"
                      graph_data={chartData}
                      graph_title="cloud"
                    />
                  )}
                </Card>
              </div>
            </div>
            <div className="inline-flex items-start gap-[18px] relative flex-[0_0_auto]">
              <div className="relative w-[450px] h-[299px] bg-black rounded-[13.94px] ">
                <Card className="p-2 bg-black rounded-lg border border-white">
                  <div className="text-white mb-3">Buying/Selling</div>
                  {chartData && (
                    <LineChart
                      className="w-full h-[150px] md:h-[200px] lg:h-[250px]"
                      graph_data={chartData}
                      graph_title="buying_selling"
                    />
                  )}
                </Card>
              </div>
              <div className="relative w-[450px] h-[299px] bg-black rounded-[13.94px] ">
                <Card className="p-2 bg-black rounded-lg border border-white">
                  <div className="text-white mb-3">Power Generated</div>
                  {chartData && (
                    <LineChart
                      className="w-full h-[150px] md:h-[200px] lg:h-[250px]"
                      graph_data={chartData}
                      graph_title="power_generated"
                    />
                  )}
                </Card>
              </div>
              <div className="relative w-[450px] h-[299px] bg-black rounded-[13.94px] ">
                <Card className="p-2 bg-black rounded-lg border border-white">
                  <div className="text-white mb-3">Surplus Power</div>
                  {chartData && (
                    <LineChart
                      className="w-full h-[150px] md:h-[200px] lg:h-[250px]"
                      graph_data={chartData}
                      graph_title="surplus"
                    />
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LineChart({
  className,
  graph_title,
  graph_data,
}: {
  className: string;
  graph_title: string;
  graph_data: any;
}) {
  var datasets = [
    {
      fill: true,
      label: "At 0",
      data: graph_data[graph_title]["0"], //[-1,1],//graph_data[graph_title]['0'],
      borderColor: "rgba(255, 0, 0, 1)",
      backgroundColor: "rgba(255, 0, 0, 0.2)",
    },
    {
      fill: true,
      label: "At 50",
      data: graph_data[graph_title]["50"], //[1,2],//graph_data[graph_title]['50'],
      borderColor: "rgba(0, 255, 0, 1)",
      backgroundColor: "rgba(0, 255, 0, 0.2)",
    },
    {
      fill: true,
      label: "At 100",
      data: graph_data[graph_title]["100"], //[3,4],//graph_data[graph_title]['100'],
      borderColor: "rgba(0, 0, 255, 1)",
      backgroundColor: "rgba(0, 0, 255, 0.2)",
    },
  ];
  if (graph_title == "power_demand") {
    datasets = [
      {
        label: "power_demand",
        fill: true,
        data: graph_data[graph_title],
        borderColor: "rgba(255, 0, 0, 1)",
        backgroundColor: "rgba(255, 0, 0, 0.2)",
      },
    ];
  }
  const data = {
    labels: graph_data["time"],
    datasets: datasets,
  };
  return (
    <div className={className}>
      <Line data={data} />
    </div>
  );
}
