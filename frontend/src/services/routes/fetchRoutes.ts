import axios from "axios";

export async function fetchAllRoutes() {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_MY_BACKEND_API}/routes`, { withCredentials: true });
  console.log(response.data);
  return response.data;
}