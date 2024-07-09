"use client";
import { Layout as AntLayout, Menu } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import Link from "next/link";
import { ReactNode } from "react";

const { Header, Content } = AntLayout;

interface LayoutProps {
  children: ReactNode;
}

const items = [
  { key: "home", label: <Link href="/">Главная</Link>, icon: <HomeOutlined /> },
  { key: "matches", label: <Link href="/matches">Матчи</Link> },
  { key: "standings", label: <Link href="/standings">Таблица</Link> },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Header
        style={{ display: "flex", alignItems: "center", padding: "0 20px" }}
      >
        <Menu
          theme="dark"
          mode="horizontal"
          style={{ flex: 1, display: "flex" }}
          items={items}
        />
      </Header>
      <Content style={{ padding: "20px" }}>{children}</Content>
    </AntLayout>
  );
};

export default Layout;
