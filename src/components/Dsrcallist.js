import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import DSRnav from "./DSRnav";
import moment from "moment";
import { Co2Sharp } from "@mui/icons-material";

function Dsrcallist() {
  const apiURL = process.env.REACT_APP_API_URL;
  const { date, category } = useParams();
  const paramsData = date;
  const [treatmentData, settreatmentData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [dsrdata, setdsrdata] = useState([]);
  const [dsrdata1, setdsrdata1] = useState([]);
  const [searchJobCatagory, setSearchJobCatagory] = useState("");
  const [searchCustomerName, setSearchCustomerName] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const [searchContact, setSearchContact] = useState("");
  const [searchTechName, setSearchTechName] = useState("");
  const [searchJobType, setSearchJobType] = useState("");
  const [searchDesc, setSearchDesc] = useState("");
  const [vddata, setvddata] = useState([]);
  const [techName, setTechName] = useState([]);

  useEffect(() => {
    getservicedata();
  }, [category]);

  useEffect(() => {}, [treatmentData]);

  useEffect(() => {
    getnameof();
  }, [category, date, dsrdata, treatmentData]);

  const getnameof = async () => {
    let res = await axios.get(apiURL + "/getalltechnician");
    if ((res.status = 200)) {
      const TDdata = res.data?.technician;
      const filteredTechnicians = TDdata.filter((technician) => {
        return technician.category.some((cat) => cat.name === category);
      });
      setTechName(TDdata);
      setvddata(
        filteredTechnicians.filter(
          (i) => i._id == dsrdata[0]?.TechorPMorVenodrID
        )
      );
    }
  };

  console.log("treatmentData", treatmentData);

  const getservicedata = async () => {
    let res = await axios.get(apiURL + "/getrunningdata");
    if (res.status === 200) {
      const data = res.data?.runningdata;

      const filteredData = data.filter((item) => {
        const formattedDates = item.dividedDates.map((date) =>
          moment(date.date).format("YYYY-MM-DD")
        );
        return formattedDates.includes(date) && item.category === category;
      });

      settreatmentData(filteredData);
      setSearchResults(filteredData);
    }
  };

  useEffect(() => {
    getAlldata();
  }, [treatmentData]);

  const getAlldata = async () => {
    try {
      const res = await axios.get(apiURL + "/getaggredsrdata");

      if (res.status === 200) {
        const filteredData = res.data.addcall.filter((i) => {
          const dateMatches = i.serviceDate === date;
          const cardNoMatches = treatmentData.some((treatmentItem) => {
            return treatmentItem.cardNo === i.cardNo;
          });

          return dateMatches && cardNoMatches;
        });
        setdsrdata1(res.data.addcall);
        setdsrdata(filteredData);
        // setTechData(mayiru);
      }
    } catch (error) {
      // Handle any errors from the Axios request
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    async function filterResults() {
      try {
        let results = treatmentData;
        if (searchJobCatagory) {
          results = results.filter(
            (item) =>
              item.jobCategory &&
              item.jobCategory
                .toLowerCase()
                .includes(searchJobCatagory.toLowerCase())
          );
        }
        if (searchCustomerName) {
          results = results.filter(
            (item) =>
              item.customer[0]?.customerName &&
              item.customer[0]?.customerName
                .toLowerCase()
                .includes(searchCustomerName.toLowerCase())
          );
        }
        if (searchCity) {
          results = results.filter(
            (item) =>
              item.customer[0]?.city &&
              item.customer[0]?.city
                .toLowerCase()
                .includes(searchCity.toLowerCase())
          );
        }
        if (searchAddress) {
          results = results.filter(
            (item) =>
              (item.customer[0]?.cnap &&
                item.customer[0]?.cnap
                  .toLowerCase()
                  .includes(searchAddress.toLowerCase())) ||
              (item.customer[0]?.rbhf &&
                item.customer[0]?.rbhf
                  .toLowerCase()
                  .includes(searchAddress.toLowerCase()))
          );
        }
        if (searchContact) {
          results = results.filter((item) =>
            item.customer[0]?.mainContact &&
            typeof item.customer[0]?.mainContact === "string"
              ? item.mainContact
                  .toLowerCase()
                  .includes(searchContact.toLowerCase())
              : ""
          );
        }
        if (searchTechName) {
          results = results.filter(
            (item) =>
              item.dsrdata[0]?.TechorPMorVendorName &&
              item.dsrdata[0]?.TechorPMorVendorName.toLowerCase().includes(
                searchTechName.toLowerCase()
              )
          );
        }
        if (searchJobType) {
          results = results.filter(
            (item) =>
              item.service &&
              item.service.toLowerCase().includes(searchJobType.toLowerCase())
          );
        }
        if (searchDesc) {
          results = results.filter(
            (item) =>
              item.customerFeedback &&
              item.customerFeedback
                .toLowerCase()
                .includes(searchDesc.toLowerCase())
          );
        }
        setSearchResults(results);
      } catch (error) {
        console.log("Error in Search", error);
      }
    }
    filterResults();
  }, [
    searchJobCatagory,
    searchCustomerName,
    searchCity,
    searchAddress,
    searchContact,
    searchJobType,
    searchDesc,
  ]);

  let i = 1;

  const passfunction = (sId) => {
    const filt = dsrdata1.filter(
      (i) => i.serviceInfo[0]?._id === sId._id && i.serviceDate == date
    );
    const TTnameValue = filt[0]?.TechorPMorVendorName;

    return TTnameValue;
  };

  const SERVICESTARTED = (service) => {
    const filterStartTime = dsrdata1.filter(
      (item) =>
        item.serviceInfo[0]?._id === service._id && item.serviceDate == date
    );
    return filterStartTime[0]?.startJobTime;
  };

  const SERVICECOMPLETED = (service) => {
    const filterStartTime = dsrdata1.filter(
      (item) =>
        item.serviceInfo[0]?._id === service._id && item.serviceDate == date
    );
    return filterStartTime[0]?.endJobTime;
  };

  const SERVICECOMPLETEDBYOP = (service) => {
    const filterStartTime = dsrdata1.filter(
      (item) =>
        item.serviceInfo[0]?._id === service._id && item.serviceDate == date
    );
    return filterStartTime[0]?.jobComplete;
  };

  const charge = treatmentData.map((ele) => {
    const foundCharge = ele.dividedDates.reduce((acc, ele1, index) => {
      const dividedDate = new Date(ele1.date).getDate();

      if (
        dividedDate === new Date(ele.dividedamtDates[index]?.date).getDate() &&
        dividedDate === new Date(paramsData).getDate()
      ) {
        return ele.dividedamtCharges[index].charge;
      }

      return acc;
    }, null);

    return foundCharge !== null ? foundCharge : 0;
  });

  return (
    <div className="web">
      <Header />
      <DSRnav />
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div className="shadow-sm" style={{ border: "1px #cccccc solid" }}>
          <div
            className="ps-1 pe-1"
            style={{ borderBottom: "1px #cccccc solid" }}
          >
            NOT ASSIGNED
          </div>
          <div
            className="ps-1 pe-1"
            style={{
              backgroundColor: "#e2e3e5",
            }}
          >
            ASSIGNED FOR TECHNICIAN
          </div>
          <div
            className="ps-1 pe-1"
            style={{
              backgroundColor: "#ffeb3b",
            }}
          >
            SERVICE STARTED
          </div>
          <div className="ps-1 pe-1" style={{ backgroundColor: "#4caf50" }}>
            SERIVCE COMPLETED
          </div>
          <div className="ps-1 pe-1" style={{ backgroundColor: "#f44336" }}>
            SERIVCE CANCELLED
          </div>
          <div className="ps-1 pe-1" style={{ backgroundColor: "#2196f3" }}>
            SERIVCE DELAYED
          </div>
          <div
            className="ps-1 pe-1"
            style={{ backgroundColor: "rgb(182, 96, 255)" }}
          >
            CLOSED OPERATION MANAGER
          </div>
        </div>
      </div>
      <div className="row m-auto">
        <div className="col-md-12">
          <table
            class="table table-hover table-bordered mt-1"
            style={{ width: "113%" }}
          >
            <thead className="">
              <tr className="table-secondary">
                <th className="table-head" scope="col"></th>
                <th className="table-head" scope="col"></th>

                <th
                  className="table-head"
                  style={{ width: "13%" }}
                  scope="col"
                ></th>
                <th scope="col" className="table-head">
                  <input
                    className="vhs-table-input"
                    value={searchJobCatagory}
                    onChange={(e) => setSearchJobCatagory(e.target.value)}
                  />{" "}
                </th>

                <th scope="col" className="table-head">
                  <input
                    className="vhs-table-input"
                    value={searchCustomerName}
                    onChange={(e) => setSearchCustomerName(e.target.value)}
                  />{" "}
                </th>
                <th scope="col" className="table-head">
                  <select
                    className="vhs-table-input"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                  >
                    <option value="">Select</option>
                    {treatmentData.map((e) => (
                      <option
                        value={e.customer[0]?.city}
                        key={e.customer[0]?.city}
                      >
                        {e.customer[0]?.city}{" "}
                      </option>
                    ))}
                  </select>{" "}
                </th>
                <th scope="col" style={{ width: "15%" }} className="table-head">
                  <input
                    className="vhs-table-input"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                  />{" "}
                </th>
                <th scope="col" className="table-head">
                  <input
                    className="vhs-table-input"
                    value={searchContact}
                    onChange={(e) => setSearchContact(e.target.value)}
                  />{" "}
                </th>
                <th scope="col" className="table-head">
                  <select
                    className="vhs-table-input" //no Technician name
                    value={searchTechName}
                    onChange={(e) => setSearchTechName(e.target.value)}
                  >
                    <option value="">Select</option>
                    {dsrdata.map((e) => (
                      <option
                        value={e.TechorPMorVendorName}
                        key={e.TechorPMorVendorName}
                      >
                        {e.TechorPMorVendorName}{" "}
                      </option>
                    ))}
                  </select>{" "}
                </th>
                <th scope="col" className="table-head">
                  <input
                    className="vhs-table-input"
                    value={searchJobType}
                    onChange={(e) => setSearchJobType(e.target.value)}
                  />{" "}
                </th>
                <th scope="col" className="table-head">
                  <input
                    className="vhs-table-input"
                    value={searchDesc}
                    onChange={(e) => setSearchDesc(e.target.value)}
                  />{" "}
                </th>
                <th scope="col" className="table-head">
                  <input
                    className="vhs-table-input"
                    value={searchDesc}
                    onChange={(e) => setSearchDesc(e.target.value)}
                  />{" "}
                </th>

                <th scope="col" className="table-head"></th>
              </tr>
              <tr className="table-secondary">
                <th className="table-head" scope="col">
                  Sr.No
                </th>
                <th className="table-head" scope="col">
                  Category
                </th>
                <th className="table-head" scope="col">
                  Date
                </th>
                <th className="table-head" scope="col">
                  Time
                </th>

                <th scope="col" className="table-head">
                  Customer Name
                </th>
                <th scope="col" className="table-head">
                  City
                </th>
                <th scope="col" style={{ width: "15%" }} className="table-head">
                  Address
                </th>
                <th scope="col" className="table-head">
                  Contact No.
                </th>
                {dsrdata[0]?.techName === "PM" ? (
                  <th scope="col" className="table-head">
                    Project manager
                  </th>
                ) : (
                  <th scope="col" className="table-head">
                    Technician
                  </th>
                )}

                <th scope="col" className="table-head">
                  Worker Name
                </th>
                <th scope="col" className="table-head">
                  Job Type
                </th>
                <th scope="col" className="table-head">
                  Job Amount
                </th>
                <th scope="col" className="table-head">
                  Description
                </th>

                {/* <th scope="col" className="table-head">
                  Amount
                </th> */}
              </tr>
            </thead>
            <tbody>
              {treatmentData?.map((selectedData, index) => (
                // const chargeForCurrentRow = charge[index] || 0;
                <tr
                  className="user-tbale-body"
                  key={index}
                  style={{
                    backgroundColor: SERVICECOMPLETED(selectedData)
                      ? "#4caf50"
                      : SERVICESTARTED(selectedData)
                      ? "#ffeb3b"
                      : passfunction(selectedData)
                      ? "#e2e3e5"
                      : SERVICECOMPLETEDBYOP(selectedData)
                      ? "rgb(244, 67, 54)"
                      : "",
                  }}
                >
                  <Link
                    to="/dsrdetails "
                    className="tbl"
                    state={{
                      data: selectedData,
                      data1: date,
                      TTname: passfunction(selectedData),
                    }}
                  >
                    <td>{i++}</td>
                    <td>{selectedData.category}</td>
                    <td>{date}</td>
                    <td>{selectedData.selectedSlotText}</td>

                    <td>{selectedData.customerData[0]?.customerName}</td>

                    {selectedData.type === "userapp" ? (
                      <td>{selectedData.city}</td>
                    ) : (
                      <td>{selectedData.customer[0]?.city}</td>
                    )}
                    <td>
                      {selectedData?.deliveryAddress
                        ? `
                        ${selectedData.deliveryAddress?.platNo},
                        ${selectedData.deliveryAddress?.address} - 
                        ${selectedData.deliveryAddress?.landmark}
                        `
                        : `${selectedData.customer[0]?.rbhf} ,
                       ${selectedData.customer[0]?.cnap} ,
                       ${selectedData.customer[0]?.lnf}`}
                    </td>

                    <td>{selectedData.customerData[0]?.mainContact}</td>

                    <td>
                      {/* {TTname} */}
                      {passfunction(selectedData)}
                    </td>

                    <td>{dsrdata[0]?.workerName}</td>
                    <td>{selectedData.service}</td>
                    {selectedData.type === "userapp" ? (
                      <td>{selectedData?.GrandTotal}</td>
                    ) : (
                      <td>{charge} </td>
                    )}

                    <td>{selectedData.desc}</td>
                  </Link>
                </tr>
              ))}
            </tbody>
          </table>{" "}
        </div>
      </div>
    </div>
  );
}

export default Dsrcallist;
