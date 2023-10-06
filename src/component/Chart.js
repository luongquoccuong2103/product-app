import axios from "axios";
import {
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from "chart.js";
import "chartjs-adapter-luxon";
import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import useWebSocket from "react-use-websocket";

const testReportData = [
  {
    productId: "c273fedc-7505-48d6-a074-3ff50dda9a93",
    device: "Mac OS X",
    timestamp: "2023-10-06T12:48:00.000Z",
    count: 15,
  },
];

ChartJS.register(
  // CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

function intervalMinutesBetween(
  startTimestamp,
  endTimestamp,
  intervalMinutes = 1
) {
  const start = DateTime.fromISO(startTimestamp);
  const end = DateTime.fromISO(endTimestamp);

  if (!start.isValid || !end.isValid) {
    return []; // Invalid input, return an empty array
  }

  const times = [];
  let currentTime = start;

  while (currentTime <= end) {
    times.push(currentTime.toUTC().toISO());
    currentTime = currentTime.plus({ minutes: intervalMinutes });
  }

  return times;
}

const getProducts = () => axios.get("/api/products").then(({ data }) => data);
const getReports = () =>
  axios.post("/analytics/reports", {}).then(({ data }) => data);
const generateColorPart = () => Math.floor(Math.random() * 256);
const generateColor = () =>
  `rgba(${generateColorPart()}, ${generateColorPart()}, ${generateColorPart()}, 1)`;

const TimelineChart = () => {
  const [productData, setProductData] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [productColors, setProductColors] = useState({});
  const [reportData, setReportData] = useState({});
  const [dateRange, setDateRange] = useState({});

  useWebSocket(`ws://${window.location.host}/analytics/ws/reports`, {
    onOpen: () => console.log("Connected to report source"),
    onMessage: ({ data }) => {
      if (!data) {
        return;
      }
      const json = JSON.parse(data);
      const { productId, time } = json;
      setReportData({
        ...reportData,
        [productId]: { ...(reportData[productId] ?? {}), [time]: json },
      });
      const nearestMinute = DateTime.fromISO(time)
        .set({ second: 0, millisecond: 0 })
        .toUTC()
        .toISO();
      if (!dateRange.endTime || DateTime.fromISO(time).set({second: 0, millisecond: 0}).toUTC() > DateTime.fromISO(dateRange.endTime).toUTC()) {
        setDateRange((dateRange) => ({ ...dateRange, endTime: nearestMinute }));
      }
    },
  });

  const fetchReportData = async () => {
    try {
      const {
        reports,
        request: { startTime, endTime },
      } = await getReports();
      setDateRange({
        startTime: DateTime.fromISO(startTime, { zone: "utc" }).toISO(),
        endTime: DateTime.fromISO(endTime, { zone: "utc" }).toISO(),
      });
      setReportData(
        reports
          .map((data) => [data.productId, data.time, data])
          .reduce(
            (current, [productId, time, data]) => ({
              ...current,
              [productId]: {
                ...(current[productId] ?? {}),
                [DateTime.fromISO(time, { zone: "utc" }).toISO()]: {
                  ...data,
                  time: DateTime.fromISO(time, { zone: "utc" }).toISO(),
                },
              },
            }),
            {}
          )
      );
    } catch (error) {
      console.error("Error fetching product data:", error);
    }
  };

  const fetchProductData = async () => {
    try {
      const products = await getProducts();
      const initialSelectedProducts = products
        .map(({ id: productId }) => productId)
        .reduce((current, next) => ({ ...current, [next]: true }), {});
      const initialProductColors = products
        .map(({ id: productId }) => productId)
        .reduce(
          (current, next) => ({ ...current, [next]: generateColor() }),
          {}
        );
      setSelectedProducts(initialSelectedProducts);
      setProductColors(initialProductColors);
      setProductData(products);
    } catch (error) {
      console.error("Error fetching product data:", error);
    }
  };

  useEffect(() => {
    Promise.all([fetchProductData(), fetchReportData()]);
    const interval = setInterval(() => {
      const now = DateTime.now()
        .set({ second: 0, millisecond: 0 })
        .toUTC()
        .toISO();
      setDateRange((dateRange) => ({ ...dateRange, endTime: now }));
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => console.log(reportData), [reportData]);

  const generateReport = (productIds) => {
    const reports = [];
    const xLabels = intervalMinutesBetween(
      dateRange.startTime,
      dateRange.endTime
    );
    if (!productData.length) {
      return [];
    }
    for (const { id, name } of productData) {
      if (!productIds.includes(id)) {
        continue;
      }
      reports.push({
        label: name,
        borderColor: productColors?.[id], // Use assigned color for the product
        fill: false,
        data: xLabels.map((x) => ({
          x,
          y: reportData?.[id]?.[x]?.clicks ?? 0,
        })),
      });
    }
    return reports;
  };

  const handleProductToggle = (productId) => {
    setSelectedProducts((prevSelectedProducts) => ({
      ...prevSelectedProducts,
      [productId]: !prevSelectedProducts[productId],
    }));
  };

  return (
    <div>
      <div>
        {productData.map((product) => (
          <label
            key={product.id}
            style={{
              marginRight: "20px",
              color: productColors[product.id],
              cursor: "pointer",
            }}
            onClick={() => handleProductToggle(product.id)}
          >
            <input
              type="checkbox"
              checked={!!selectedProducts[product.id]}
              readOnly
            />
            {product.name}
          </label>
        ))}
      </div>
      <div>
        <Line
          options={{
            scales: {
              x: {
                type: "time",
                time: {
                  unit: "minute",
                },
              },
            },
          }}
          data={{
            datasets: generateReport(
              Object.entries(selectedProducts)
                .filter(([id, selected]) => !!selected)
                .map(([id, _]) => id)
            ),
          }}
        />
      </div>
    </div>
  );
};

export default TimelineChart;
