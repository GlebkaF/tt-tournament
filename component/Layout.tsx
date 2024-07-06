"use client";

import { Layout as AntLayout, Menu } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import Link from "next/link";
import { ReactNode } from "react";

const { Header, Content } = AntLayout;

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", alignItems: "center" }}>
        <Menu theme="dark" mode="horizontal" style={{ minWidth: "200px" }}>
          <Menu.Item key="home">
            <Link href="/">Главная</Link>
          </Menu.Item>
          <Menu.Item key="matches">
            <Link href="/matches">Матчи</Link>
          </Menu.Item>
          <Menu.Item key="standings">
            <Link href="/standings">Таблица</Link>
          </Menu.Item>
          {/* <Menu.Item key="schedule">
            <Link href="/schedule">Расписание</Link>
          </Menu.Item> */}
        </Menu>
      </Header>
      <Content style={{ padding: "20px" }}>{children}</Content>
    </AntLayout>
  );
};

export default Layout;
