import { Scheduler } from "@aldabil/react-scheduler";
import React, { useState, useEffect } from "react";
import Header from "../layout/Header";
import DSRnav from "../DSRnav";
import axios from "axios";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import { useNavigate } from "react-router-dom";

function DSRcategory() {
  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const [servicedata, setservicedata] = useState([]);
  const apiURL = process.env.REACT_APP_API_URL;
  const [categorydata, setcategorydata] = useState([]);
  const [dCategory, setcategory] = useState([]);
  const localizer = momentLocalizer(moment);
  const [view, setView] = React.useState("month"); // The current view of the calendar

  const navigate = useNavigate();

  const [dsrdata, setdsrdata] = useState([]);
  const [dsrnewdata, setdsrnewdata] = useState([]);

  const [totalCount, setTotalCount] = useState(0);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const currentMonth = moment().month() + 1; // Get the current month (1-12)

    const initialFilteredData = dsrdata.filter((item) => {
      return item.dividedDates.some((date) => {
        const month = moment(date.date).month() + 1;
        return month === currentMonth;
      });
    });

    let count = 0;
    initialFilteredData.forEach((item) => {
      count += item.dividedDates.length;
    });

    setTotalCount(count);
    setFilteredData(initialFilteredData);
  }, [dsrdata]); // Trigger the effect whenever the data changes

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleRangeChange = (range) => {
    const targetMonth = range.start.getMonth() + 1; // Get the target month (1-12)

    const newFilteredData = dsrdata.filter((item) => {
      return item.dividedDates.some((date) => {
        const month = moment(date.date).month() + 1;
        return month === targetMonth;
      });
    });

    let count = 0;
    newFilteredData.forEach((item) => {
      count += item.dividedDates.length;
    });

    setTotalCount(count);
    setFilteredData(newFilteredData);
  };

  const convertedObject = dsrnewdata.reduce((result, item) => {
    const { dividedDates } = item;
    result[dividedDates] = item;
    return result;
  }, {});

  const newdata = new Date(convertedObject).toLocaleDateString();

  useEffect(() => {
    getcategory();
    getAlldsr();
  }, []);

  const getAlldsr = async () => {
    let res = await axios.get(apiURL + "/getservicedetails");
    if (res.status === 200) {
      setdsrdata(res.data.servicedetails);
    }
  };

  useEffect(() => {
    postAllJobs();
  }, [dCategory]);

  const postAllJobs = async () => {
    try {
      const res = await axios.post(apiURL + "/postservicecat", {
        category: dCategory,
      });

      if (res.status === 200) {
        setdsrnewdata(res.data?.servicedetails);
      }
    } catch (error) {
      console.error(error);
      // Handle error
    }
  };

  const getcategory = async () => {
    let res = await axios.get(apiURL + "/getcategory");
    if (res.status === 200) {
      setcategorydata(res.data?.category);
    }
  };

  const eventCounts = dsrnewdata.reduce((counts, item) => {
    const newdates = item.dividedDates;

    newdates.forEach((newdate) => {
      const formattedDate = moment(newdate.date).format("YYYY-MM-DD");
      counts[formattedDate] = (counts[formattedDate] || 0) + 1;
    });

    return counts;
  }, {});

  const myEventsList = Object.keys(eventCounts).map((date) => ({
    title: `${eventCounts[date]} DSR`,
    start: new Date(date),
    end: new Date(date),
    count: eventCounts[date],
  }));

  const handleSelectEvent = (event) => {
    const selectedDate = moment(event.start).format("YYYY-MM-DD");
    const selectedData = dsrdata.filter((item) => item.dividedDates);
    console.log("selectedDatainDSRCatagory", selectedData); // Add this line to check the value
    navigate(`/dsrcallist/${selectedDate}/${dCategory}`, {
      state: { data: selectedData },
    });
  };

  return (
    <div className="web">
      <Header />
      {/* <DSRnav /> */}

      <div className="row m-auto">
        <div className="col-md-12">
          <div className="card" style={{ marginTop: "30px" }}>
            <div className="card-body p-3">
              <form>
                <div className="row">
                  <div className="col-md-4">
                    <div className="vhs-input-label">Category</div>
                    <div className="group pt-1">
                      <select
                        className="col-md-12 vhs-input-value"
                        onChange={(e) => setcategory(e.target.value)}
                      >
                        <option>-select-</option>
                        {admin?.category.map((category, index) => (
                          <option key={index} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                        {/* {categorydata.map((item) => (
                          <option value={item.category}>{item.category}</option>
                        ))} */}
                      </select>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div style={{ width: "94%", margin: "3%" }}>
            <Calendar
              localizer={localizer}
              events={myEventsList}
              onView={handleViewChange}
              startAccessor="start"
              endAccessor="end"
              selectable
              onSelectEvent={handleSelectEvent}
              onRangeChange={handleRangeChange}
              style={{ height: 500 }}
            />
            <br />
            <div
              style={{
                backgroundColor: "rgb(169, 4, 46)",
                textAlign: "center",
              }}
            >
              <p class="header-text">DSR - {totalCount} </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default DSRcategory;
