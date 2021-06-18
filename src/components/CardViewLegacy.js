import React, { useEffect, useState } from "react";
import { Card, Col, Row, Pagination } from "antd";
import { connect } from "react-redux";
import { fetch, fetchOne } from "../utils/OmekaS";

const chunk = (array, size) => {
  if (!array) return [];
  const firstChunk = array.slice(0, size);
  if (!firstChunk.length) {
    return array;
  }
  return [firstChunk].concat(chunk(array.slice(size, array.length), size));
};

const CardViewLegacy = (props) => {
  const [items, setItems] = useState([]);
  const [cards, setCards] = useState([]);
  const [cardGrid, setCardGrid] = useState(<></>);

  const PAGESIZE = 20;

  useEffect(() => {
    const fetchInitial = async () => {
      const data = await fetch(
        props.query.endpoint,
        props.query.item_set_id,
        props.query.params,
        0,
        PAGESIZE
      );

      setItems(data);
    };

    fetchInitial();
  }, [props.query]);

  useEffect(() => {
    const genCards = async (items) => {
      const cardPromises = items.map(async (item) => {
        let thumbnailUrl = "";
        if (item["o:media"].length !== 0) {
          const media = await fetchOne(
            "media",
            item["o:media"][0]["o:id"]
          );

          thumbnailUrl = media["o:thumbnail_urls"].square;
        }

        const body = props.activeProperties.map((property) => {
          const label = property["o:label"];
          const value = item[property["o:term"]];

          const line =
            value && value.length > 0 ? (
              <p>
                <b>{label}: </b> {value[0]["@value"]}
              </p>
            ) : (
              ""
            );

          return line;
        });

        const str = item["@type"][item["@type"].length - 1];
        const n = str.lastIndexOf(":");
        const typeString = str.substring(n + 1);

        return (
          <Card
            key={item["o:id"]}
            title={item["o:title"] ?? "(no 'title' found)"}
            bordered={false}
            cover={
              thumbnailUrl ? <img alt="example" src={thumbnailUrl} /> : null
            }
          >
            <p>
              <b>Omeka-S Type: </b> {typeString}
            </p>
            {body}
          </Card>
        );
      });

      Promise.all(cardPromises).then((cards) => setCards(cards));
    };

    genCards(items);
  }, [props.activeProperties, items]);

  useEffect(() => {
    const cardCols = cards.map((card, i) => (
      <Col key={i} span={6}>
        {card}
      </Col>
    ));
    const rows = chunk(cardCols, 4).map((chunk, i) => (
      <Row key={i} gutter={[16, 16]}>
        {chunk}
      </Row>
    ));

    setCardGrid(rows);
  }, [cards]);

  const handleChange = (page, pageSize) => {
    fetch(
      props.query.endpoint,
      props.query.item_set_id,
      props.query.params,
      (page - 1) * pageSize,
      PAGESIZE
    ).then((data) => setItems(data));
  };

  return (
    <>
      {cardGrid}
      <Pagination
        defaultCurrent={1}
        total={props.query.size}
        onChange={handleChange}
      />
    </>
  );
};

const mapStateToProps = (state, props) => {
  return {
    ...props,
    query: state.query,
  };
};

export default connect(mapStateToProps)(CardViewLegacy);
