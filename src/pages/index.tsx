/* eslint-disable no-unused-vars */
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
// eslint-disable-next-line import/order
import Head from "next/head";

// eslint-disable-next-line prettier/prettier
import React, { useState } from "react";

import styles from "@/styles/Home.module.css";

type Props = {
  message: string | null | undefined;
  prefCode: number | undefined;
  prefName: string | undefined;
};
type ButtonProps = {
  text: string;
  onClick: () => void;
  selected: number;
  index: number;
};

let titleIndex: number = 0;

function getApiKey() {
  if (!process.env.NEXT_PUBLIC_RESAS_API_KEY) {
    throw new Error("NEXT_PUBLIC_RESAS_API_KEY がありません。");
  }
  return process.env.NEXT_PUBLIC_RESAS_API_KEY;
}
export const getServerSideProps = async () => {
  const res = await axios.get(
    "https://opendata.resas-portal.go.jp/api/v1/prefectures",
    {
      headers: { "X-API-KEY": getApiKey() },
    }
  );
  const data: any = await JSON.parse(JSON.stringify(res.data.result));
  return {
    props: {
      data,
    },
  };
};

const CheckBox = ({ id, value, onChange }) => {
  return (
    <input
      id={id}
      type="checkbox"
      name="checkbox"
      className={styles.prefCode}
      onChange={onChange}
      value={value}
    />
  );
};

function Button(props: ButtonProps) {
  const { text, onClick, selected, index } = props;

  return (
    <button
      style={{
        width: "300px",
        height: "auto",
        borderRadius: "10px",
        backgroundColor: selected === index ? "orange" : "gray",
        border: "4px solid black",
        fontSize: "24px",
        fontWeight: "bold",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      {text}
    </button>
  );
}

export default function Home({ data }) {
  const [checked, setChecked] = useState<number[]>([]);
  const [selected, setSelected] = useState(0);
  const titleName: string[] = [
    "総人口",
    "年少人口",
    "生産年齢人口",
    "老齢人口",
  ];
  let Composition: any[];
  let categories: string[];
  let series: Highcharts.SeriesOptionsType[] = [];
  let selectPrefecturesName: string[] = [];
  let arrayValue: number[];
  let allPrefecturesName: any[] = [];

  let targetId: any;
  let targetChecked: any;

  let options: Highcharts.Options = {
    title: {
      text: titleName[titleIndex],
    },
    xAxis: {
      title: {
        text: "年度",
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: "人口数",
      },
      labels: {
        format: "{value}",
      },
    },

    series: [
      {
        type: "line",
        name: "無し",
        data: [],
      },
    ],
  };
  const [option, setOptions] = useState(options);

  const handleChange = async (event) => {
    targetId = event.target.id;
    targetChecked = event.target.checked;

    if (targetChecked) {
      checked.push(targetId);
    } else {
      const checkedIndex = checked.indexOf(targetId);
      checked.splice(checkedIndex, 1);
    }
    setChecked(checked);
    const allName = await axios.get(
      "https://opendata.resas-portal.go.jp/api/v1/prefectures",
      {
        headers: { "X-API-KEY": getApiKey() },
      }
    );
    allPrefecturesName.push(await JSON.parse(JSON.stringify(allName)));
    if (typeof window !== "undefined") {
      window.Highcharts = Highcharts;
    }

    Composition = [];
    categories = [];
    arrayValue = [];
    series = [];
    for (let index = 0; index < checked.length; index++) {
      let resComposition = await axios.get(
        "https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear",
        {
          headers: { "X-API-KEY": getApiKey() },
          params: { prefCode: Number(checked[index]), cityCode: "-" },
        }
      );

      const dataComposition = await JSON.parse(JSON.stringify(resComposition));
      Composition.push(dataComposition);
      arrayValue = [];
      selectPrefecturesName = [];
      categories = [];

      for (
        let index3 = 0;
        index3 < Composition[index].data.result.data[titleIndex].data.length;
        index3++
      ) {
        categories.push(
          String(
            Composition[index].data.result.data[titleIndex].data[index3].year
          )
        );
        arrayValue.push(
          Composition[index].data.result.data[titleIndex].data[index3].value
        );
      }
      selectPrefecturesName[0] =
        allPrefecturesName[0].data.result[Number(checked[index]) - 1].prefName;

      series.push({
        type: "spline",
        name: selectPrefecturesName[0],
        data: arrayValue,
        animation: false,
      });
      arrayValue = [];
      selectPrefecturesName = [];
    }

    setTimeout(() => {
      options = {
        chart: {
          animation: false,
        },
        title: {
          text: titleName[titleIndex],
        },
        xAxis: {
          title: {
            text: "年度",
          },
          categories: categories,
        },
        yAxis: {
          min: 0,
          title: {
            text: "人口数",
          },
          labels: {
            format: "{value}",
          },
        },
        series: series,
      };
    }, 100);

    setTimeout(() => {
      setOptions(options);
    }, 220);
  };

  const handleClick = async (index: number) => {
    titleIndex = index;

    series = [];
    const allName = await axios.get(
      "https://opendata.resas-portal.go.jp/api/v1/prefectures",
      {
        headers: { "X-API-KEY": getApiKey() },
      }
    );
    allPrefecturesName.push(await JSON.parse(JSON.stringify(allName)));
    if (typeof window !== "undefined") {
      window.Highcharts = Highcharts;
    }
    Composition = [];
    categories = [];
    arrayValue = [];
    series = [];
    for (let index = 0; index < checked.length; index++) {
      let resComposition = await axios.get(
        "https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear",
        {
          headers: { "X-API-KEY": getApiKey() },
          params: { prefCode: Number(checked[index]), cityCode: "-" },
        }
      );

      const dataComposition = await JSON.parse(JSON.stringify(resComposition));
      Composition.push(dataComposition);
      arrayValue = [];
      selectPrefecturesName = [];
      categories = [];
      for (
        let index3 = 0;
        index3 < Composition[index].data.result.data[titleIndex].data.length;
        index3++
      ) {
        categories.push(
          String(
            Composition[index].data.result.data[titleIndex].data[index3].year
          )
        );
        arrayValue.push(
          Composition[index].data.result.data[titleIndex].data[index3].value
        );
      }
      selectPrefecturesName[0] =
        allPrefecturesName[0].data.result[Number(checked[index]) - 1].prefName;

      series.push({
        type: "spline",
        name: selectPrefecturesName[0],
        data: arrayValue,
        animation: false,
      });
      arrayValue = [];
      selectPrefecturesName = [];
    }

    setTimeout(() => {
      options = {
        chart: {
          animation: false,
        },
        title: {
          text: titleName[titleIndex],
        },
        xAxis: {
          title: {
            text: "年度",
          },
          categories: categories,
        },
        yAxis: {
          min: 0,
          title: {
            text: "人口数",
          },
          labels: {
            format: "{value}",
          },
        },
        series: series,
      };
    }, 100);

    setTimeout(() => {
      setOptions(options);
    }, 220);

    setSelected(index);
  };

  const title = "都道府県別人口推移グラフ";
  const selectTitle = "地域選択";
  return (
    <>
      <Head>
        <title>都道府県別人口推移グラフアプリ</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div>
          <div className={styles.title}>
            <h1>{title}</h1>
          </div>
          <div className={styles.selectTitle}>
            <h2>{selectTitle}</h2>
          </div>
          <div className={styles.description}>
            {data.map((item: Props) => {
              return (
                <>
                  <div className={styles.prefCodeAndName}>
                    <CheckBox
                      id={item.prefCode}
                      value={item.prefCode}
                      onChange={handleChange}
                    />

                    <label
                      className={styles.prefName}
                      id={"labelNameNo" + item.prefCode}
                    >
                      {item.prefName}
                    </label>
                  </div>
                </>
              );
            })}
          </div>
          <div id="HighchartsContainer">
            {!checked && (
              <HighchartsReact highcharts={Highcharts} options={option} />
            )}
            {checked && (
              <HighchartsReact highcharts={Highcharts} options={option} />
            )}
          </div>
          <div
            style={{
              display: "flex",
              margin: "50px",
              gap: "80px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {["総人口", "年少人口", "生産年齢人口", "老齢人口"].map(
              (text, index) => (
                <Button
                  key={text}
                  text={text}
                  onClick={() => handleClick(index)}
                  selected={selected}
                  index={index}
                />
              )
            )}
          </div>
        </div>
      </main>
    </>
  );
}
