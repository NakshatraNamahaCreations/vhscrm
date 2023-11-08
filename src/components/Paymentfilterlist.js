import React, { useState, useEffect, useContext } from "react";
import Header from "../components/layout/Header";
import axios from "axios";
import Table from "react-bootstrap/Table";
import { useLocation, useParams, Link, NavLink } from "react-router-dom";
import DSRnav from "./DSRnav";
import moment from "moment";
import { Button } from "react-bootstrap";

function Paymentfilterlist() {

  const [treatmentData, settreatmentData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [dsrdata, setdsrdata] = useState([]);
  const [searchJobCatagory, setSearchJobCatagory] = useState("");
  const [searchCustomerName, setSearchCustomerName] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const [searchContact, setSearchContact] = useState("");
  const [searchTechName, setSearchTechName] = useState("");
  const [searchJobType, setSearchJobType] = useState("");
  const [searchDesc, setSearchDesc] = useState("");
  const [pendingamt, setpendingamt] = useState("");

  const apiURL = process.env.REACT_APP_API_URL;
  const { date } = useParams();

  useEffect(() => {
    getservicedata();
  }, []);

  useEffect(() => {}, [treatmentData]);

  const getservicedata = async () => {
    let res = await axios.get(apiURL + "/getrunningdata");
    if (res.status === 200) {
      const data = res.data?.runningdata;

      const filteredData = data.filter((item) => {
        const formattedDates = item.dividedamtDates.map((date) =>
          moment(date.date).format("YYYY-MM-DD")
        );
        return formattedDates.includes(date);
      });

      settreatmentData(filteredData);
      setSearchResults(filteredData);
    }
  };

  console.log(searchResults);
  useEffect(() => {
    getAlldata();
  }, [treatmentData]);

  const getAlldata = async () => {
    let res = await axios.get(apiURL + "/getaggredsrdata");
    if (res.status === 200) {
      setdsrdata(res.data.addcall.filter((i) => i.serviceDate === date));
    }
  };

  const fddata = (id) => {
    const data = dsrdata.filter((i) => i.serviceInfo[0]?._id === id);

  
    return data;
  };

  // filter and search
  useEffect(() => {
    const filterResults = () => {
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
        results = results.filter((item) => {
          const mainContact = item.customerData[0]?.mainContact;
          if (typeof mainContact === "number") {
            // Convert contactNo to a string before comparing (assuming it's a number)
            return mainContact.toString().includes(searchContact);
          }
          return false;
        });
      }
      if (searchTechName) {
        results = results.filter(
          (item) =>
            item.techName && //no technician name
            item.techName.toLowerCase().includes(searchTechName.toLowerCase())
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
    };
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
  const targetDate = date;

  // Function to calculate the total amount from the paymentData array
  function calculateTotalPaymentAmount(paymentData) {
    let totalAmount = 0;
    for (const payment of paymentData) {
      const amountString = payment.amount;
      const cleanedAmountString = amountString.replace(/[^\d.-]/g, "");
      const amount = parseFloat(cleanedAmountString);
      if (!isNaN(amount)) {
        totalAmount += amount;
      }
    }
    return totalAmount.toFixed(2); // Format the total amount with two decimal places
  }

  function calculatePendingPaymentAmount(paymentData, serviceCharge) {
    const totalAmount = calculateTotalPaymentAmount(paymentData);

    const pendingAmount = totalAmount - parseFloat(serviceCharge[0]?.charge);

    return pendingAmount.toFixed(2); // Format the pending amount with two decimal places
  }

  const zero = 0;

  const confirm = async (e) => {
    e.preventDefault();

    try {
      const config = {
        url: `/updatestatus/${dsrdata[0]?._id}`,
        method: "post",
        baseURL: apiURL,
        // data: formdata,
        headers: { "content-type": "application/json" },
        data: {
          status: "comfirm",
        },
      };
      await axios(config).then(function (response) {
        if (response.status === 200) {
          // setShow(false);

          alert("updated");
        }
      });
    } catch (error) {
      console.error(error);
      alert("Somthing went wrong");
    }
  };

  return (
    <div className="web">
      <Header />
      <div className="navbar">
        <ul className="nav-tab-ul">
          <li>
            <NavLink to="/paymentcalender" activeClassName="active">
              Payment calendar view
            </NavLink>
          </li>
        </ul>
      </div>
      <div>
        {/* {amtCharges !== null ? (
        <p>The amount for {targetDate} is {amtCharges}.</p>
      ) : (
        <p>No amount found for {targetDate}.</p> */}
        {/* )} */}
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

                <th
                  className="table-head"
                  style={{ width: "13%" }}
                  scope="col"
                ></th>
                <th scope="col" className="table-head"></th>

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
                <th className="table-head" scope="col"></th>
                <th className="table-head" scope="col"></th>
                <th className="table-head" scope="col"></th>
                <th className="table-head" scope="col"></th>

                {/* 
                // <th scope="col" className="table-head"></th>
                <th scope="col" className="table-head"></th> */}
              </tr>
              <tr className="table-secondary">
                <th className="table-head" scope="col">
                  Sr.No
                </th>
                <th className="table-head" scope="col">
                  Category
                </th>
                <th className="table-head" scope="col">
                  Payment Date
                </th>

                <th scope="col" className="table-head">
                  Customer Name
                </th>
                <th scope="col" className="table-head">
                  City
                </th>
                <th scope="col" className="table-head">
                  Reference
                </th>
                <th scope="col" style={{ width: "15%" }} className="table-head">
                  Address
                </th>
                <th scope="col" className="table-head">
                  Contact No.
                </th>

                <th scope="col" className="table-head">
                  Job Type
                </th>
                <th scope="col" className="table-head">
                  Description
                </th>

                <th scope="col" className="table-head">
                  Amount
                </th>
                <th
                  scope="col"
                  className="table-head"
                  style={{ minWidth: "160px" }}
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="table-head"
                  style={{ minWidth: "160px" }}
                >
                  Payment details
                </th>

                <th scope="col" className="table-head">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((selectedData) => (
                <tr className="user-tbale-body">
                  <td>{i++}</td>
                  <td>{selectedData.category}</td>
                  <td>{date}</td>

                  <td>{selectedData.customerData[0]?.customerName}</td>
                  {selectedData?.type === "userapp" ? (
                    <td>{selectedData.city}</td>
                  ) : (
                    <td>{selectedData.customer[0]?.city}</td>
                  )}

                  <td>{selectedData.paymentMode}</td>

                  {selectedData?.type === "userapp" ? (
                    <td>
                      {selectedData?.deliveryAddress?.platNo},
                      {selectedData?.deliveryAddress?.landmark},
                      {selectedData?.deliveryAddress?.address}
                    </td>
                  ) : (
                    <td>
                      {selectedData.customer[0]?.rbhf},
                      {selectedData.customer[0]?.cnap},
                      {selectedData.customer[0]?.lnf}
                    </td>
                  )}
                  <td>{selectedData.customerData[0]?.mainContact}</td>
                  {/* <td>{dsrdata[0]?.techName}</td>

                    <td>{dsrdata[0]?.workerName}</td> */}
                  <td>{selectedData.service}</td>

                  <td>{selectedData.desc}</td>
                  {selectedData?.type === "userapp" ? (
                    <td>{selectedData?.GrandTotal}</td>
                  ) : (
                    <td>
                      {selectedData.dividedamtCharges.length > 0 && (
                        <div>
                          <p>{selectedData.dividedamtCharges[0].charge}</p>
                        </div>
                      )}
                    </td>
                  )}

                  {selectedData?.paymentMode === "Online" ? (
                    <td>
                      {" "}
                      <p style={{ color: "green" }}>PAYMENT COLLECTED</p>
                    </td>
                  ) : (
                    <td>
                      <b>
                        {calculatePendingPaymentAmount(
                          selectedData.paymentData.filter(
                            (i) =>
                              i.paymentType === "Customer" &&
                              i.serviceId === selectedData._id &&
                              i.serviceDate === date
                          ),
                          selectedData.dividedamtCharges
                        ) == 0 ? (
                          <p style={{ color: "green" }}>PAYMENT COLLECTED</p>
                        ) : (
                          <div>
                            {new Date(date) < new Date() ? (
                              <p
                                style={{
                                  background: "red",
                                  color: "white",
                                  width: "80px",
                                  textAlign: "center",
                                }}
                              >
                                Delayed
                              </p>
                            ) : (
                              "Pending"
                            )}
                          </div>
                        )}
                      </b>
                      {fddata(selectedData?._id).map((item, index) => (
                        <div>
                          {item.endJobTime ? (
                            <p
                              style={{
                                background: "purple",
                                color: "white",
                                padding: 2,
                                textAlign: "center",
                              }}
                            >
                              Updated by tech
                            </p>
                          ) : (
                            <p></p>
                          )}
                          {item.jobComplete === "YES" ? (
                            <p
                              style={{
                                background: "green",
                                color: "white",
                                padding: 2,
                                textAlign: "center",
                              }}
                            >
                              Closed by OPM{" "}
                            </p>
                          ) : (
                            ""
                          )}{" "}
                          <div>{}</div>
                        </div>
                      ))}
                    </td>
                  )}

                  <td>
                    {selectedData.paymentData.some(
                      (i) =>
                        i.paymentType === "Customer" &&
                        i.serviceId === selectedData._id &&
                        i.serviceDate === date
                    ) ? (
                      <div>
                        {selectedData.paymentData
                          .filter(
                            (i) =>
                              i.paymentType === "Customer" &&
                              i.serviceId === selectedData._id &&
                              i.serviceDate === date
                          )
                          .map((i) => (
                            <p key={i._id} className="mb-0 text-right">
                              ({i.paymentDate}) {i.amount}
                            </p>
                          ))}
                        <div>
                          <hr className="mb-0 mt-0" />
                          <p className="mb-0 text-right">
                            <b>
                              Total:{" "}
                              {calculateTotalPaymentAmount(
                                selectedData.paymentData.filter(
                                  (i) =>
                                    i.serviceId === selectedData._id &&
                                    i.paymentType === "Customer" &&
                                    i.serviceDate === date
                                )
                              )}
                            </b>
                          </p>
                          <p className="text-right">
                            <b>
                              Pending:{" "}
                              {calculatePendingPaymentAmount(
                                selectedData.paymentData.filter(
                                  (i) =>
                                    i.paymentType === "Customer" &&
                                    i.serviceId === selectedData._id &&
                                    i.serviceDate === date
                                ),
                                selectedData.dividedamtCharges
                              )}
                            </b>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p></p>
                    )}
                  </td>
                  <td>
                    <Link
                      to="/paymentfulldetails"
                      className="tbl"
                      state={{ data: selectedData, data1: date }}
                    >
                      {" "}
                      <p style={{ color: "green" }}>Payment collect</p>
                    </Link>

                    <Link
                      to="/raiseinvoice"
                      state={{ data: selectedData, data1: date }}
                    >
                      <p style={{ color: "red" }}> Raise Invoice</p>
                    </Link>
                    <b>
                      <a onClick={confirm}>
                        <b>
                          {Math.abs(
                            Number(
                              calculatePendingPaymentAmount(
                                selectedData.paymentData.filter(
                                  (i) =>
                                    i.paymentType === "Customer" &&
                                    i.serviceId === selectedData._id &&
                                    i.serviceDate === date
                                ),
                                selectedData.dividedamtCharges
                              )
                            ).toFixed(2)
                          ) < 0.01 ? (
                            <p style={{ color: "orange" }}>Confirm</p>
                          ) : null}
                        </b>
                      </a>
                    </b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>{" "}
        </div>
      </div>
    </div>
  );
}

export default Paymentfilterlist;
