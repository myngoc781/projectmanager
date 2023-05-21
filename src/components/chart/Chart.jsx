import "./chart.scss";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect,useState } from "react";
import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firbase";
import { format, subMonths, getMonth } from 'date-fns'
import { groupBy } from 'lodash';

const Chart = ({ aspect, title }) => {
  const [dataGroup, setDataGroup] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const boardsRef = collection(db, "boards");
      const querySnapshot = await getDocs(boardsRef);
      const groupedData = groupBy(querySnapshot.docs, (doc) =>
        format(doc.data().createdAt.toDate(), "MMMM")
      );
      const currentMonth = getMonth(new Date());
      const data = Array.from({ length: 12 }).map((_, i) => {
        const month = format(subMonths(new Date(), currentMonth - i), "MMMM");
        const count = groupedData[month]?.length ?? 0;
        return { name: month, Total: count };
      });
      setDataGroup(data);
      console.log(data);
    };
    fetchData();
  }, []);

  return (
    <div className="chart">
      <div className="title">{title}</div>
      <ResponsiveContainer width="100%" aspect={aspect}>
        <AreaChart
          width={730}
          height={250}
          data={dataGroup}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="total" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="gray" />
          <CartesianGrid strokeDasharray="3 3" className="chartGrid" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="Total"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#total)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
