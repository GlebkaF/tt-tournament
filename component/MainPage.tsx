"use client";

import { Row, Col, Card, Typography } from "antd";
import Link from "next/link";

const { Title } = Typography;

const MainPage: React.FC = () => {
  return (
    <div style={{ padding: "32px" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "32px" }}>
        Турнир по настольному тенису
      </Title>
      <Title level={3} style={{ textAlign: "center", marginBottom: "32px" }}>
        Европейский берег 2024
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={8}>
          <Link href="/matches">
            <Card hoverable style={{ textAlign: "center", height: "100%" }}>
              <Title level={4}>Матчи</Title>
              <p>Просмотр и управление матчами турнира</p>
            </Card>
          </Link>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Link href="/standings">
            <Card hoverable style={{ textAlign: "center", height: "100%" }}>
              <Title level={4}>Таблица</Title>
              <p>Просмотр таблицы игроков и очков</p>
            </Card>
          </Link>
        </Col>
        {/* <Col xs={24} md={12} lg={8}>
          <Link href="/schedule">
            <Card hoverable style={{ textAlign: "center", height: "100%" }}>
              <Title level={4}>Расписание</Title>
              <p>Просмотр расписания предстоящих матчей</p>
            </Card>
          </Link>
        </Col> */}
      </Row>
    </div>
  );
};

export default MainPage;
