import { useEffect, useState } from "react";
import axios from "axios";

export default function Admin() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("https://oadiscussion.onrender.com/api/experience/admin/reported", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(res => setData(res.data));
  }, []);

  return data.map(d => <div key={d._id}>{d.company}</div>);
}
