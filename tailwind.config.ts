import type { Config } from "tailwindcss";
const defaultTheme = require("tailwindcss/defaultTheme");

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./component/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      desktop: { min: "1259px" },
      tablet: { min: "576px", max: "1258px" },
      mobile: { max: "576px" },
    },
    colors: {
      white: "#ffffff",
      // text
      primary: {
        base: "#000000",
        negative: "#f25050",
        positive: "#61c86d",
      },
      secondary: {
        base: "#999999",
      },
      tetriary: {
        base: "#d9d9d9",
      },
      inverted: {
        base: "#ffffff",
      },
      disabled: {
        base: "#999999",
        inverted: "#ffffff",
      },
      link: {
        base: "#565eef",
      },
      current: "currentColor",
      brand: {
        red: "#D6034F",
        blue: "#556CE9",
      },
    },
    backgroundColor: {
      primary: {
        base: "#ffffff",
        negative: "#ffebeb",
        positive: "#dffde4",
        dark: "#000000",
      },
      secondary: {
        base: "#f4f5f6",
        light: "#f7f8f9",
      },
      tetriary: {
        base: "#e9eced",
      },
      brand: {
        base: "#556CE9",
        extralight: "#f4f4ff",
        light: "#edecff",
        medium: "#b0aeff",
        dark: "#271a58",
      },
    },
    borderColor: {
      primary: {
        base: "#e9eced",
        dark: "#000000",
      },
      secondary: {
        base: "#f4f5f6",
      },
      tetriary: {
        base: "#d9d9d9",
      },
    },
    spacing: {
      0: "0",
      2: "2px",
      4: "4px",
      8: "8px",
      12: "12px",
      16: "16px",
      24: "24px",
      20: "20px",
      32: "32px",
      36: "36px",
      40: "40px",
      48: "48px",
      60: "60px",
      80: "80px",
    },
    fontSize: {
      // heading
      "heading-xxs-desktop": [
        "16px",
        { lineHeight: "24px", fontWeight: 600, letterSpacing: "normal" },
      ],
      "heading-xxs-mobile": [
        "16px",
        { lineHeight: "22px", fontWeight: 600, letterSpacing: "normal" },
      ],
      "heading-xs-desktop": [
        "18px",
        { lineHeight: "26px", fontWeight: 600, letterSpacing: "normal" },
      ],
      "heading-xs-mobile": [
        "18px",
        { lineHeight: "24px", fontWeight: 600, letterSpacing: "normal" },
      ],
      "heading-s-desktop": [
        "20px",
        { lineHeight: "30px", fontWeight: 600, letterSpacing: "normal" },
      ],
      "heading-s-mobile": [
        "20px",
        { lineHeight: "26px", fontWeight: 600, letterSpacing: "normal" },
      ],
      "heading-m-desktop": [
        "24px",
        { lineHeight: "32px", fontWeight: 600, letterSpacing: "normal" },
      ],
      "heading-m-mobile": [
        "22px",
        { lineHeight: "28px", fontWeight: 600, letterSpacing: "normal" },
      ],
      "heading-l-desktop": [
        "32px",
        { lineHeight: "40px", fontWeight: 600, letterSpacing: "normal" },
      ],
      "heading-l-mobile": [
        "24px",
        { lineHeight: "30px", fontWeight: 600, letterSpacing: "normal" },
      ],
      "heading-xl-desktop": [
        "40px",
        { lineHeight: "48px", fontWeight: 500, letterSpacing: "-0.5px" },
      ],
      "heading-xl-mobile": [
        "28px",
        { lineHeight: "32px", fontWeight: 500, letterSpacing: "-0.25px" },
      ],
      // text
      "text-m-desktop": [
        "16px",
        { lineHeight: "24px", fontWeight: 400, letterSpacing: "normal" },
      ],
      "text-m-mobile": [
        "16px",
        { lineHeight: "22px", fontWeight: 400, letterSpacing: "normal" },
      ],
      "text-l-desktop": [
        "18px",
        { lineHeight: "26px", fontWeight: 400, letterSpacing: "normal" },
      ],
      "text-l-mobile": [
        "18px",
        { lineHeight: "24px", fontWeight: 400, letterSpacing: "normal" },
      ],

      "text-xl-desktop": [
        "24px",
        { lineHeight: "32px", fontWeight: 400, letterSpacing: "normal" },
      ],
      "text-xl-mobile": [
        "22px",
        { lineHeight: "28px", fontWeight: 400, letterSpacing: "normal" },
      ],
      "text-xxl-desktop": [
        "32px",
        { lineHeight: "40px", fontWeight: 400, letterSpacing: "normal" },
      ],
      "text-xxl-mobile": [
        "24px",
        { lineHeight: "30px", fontWeight: 400, letterSpacing: "normal" },
      ],
      // caption
      "caption-xs-desktop": [
        "12px",
        { lineHeight: "16px", fontWeight: 400, letterSpacing: "normal" },
      ],
      "caption-xs-mobile": [
        "12px",
        { lineHeight: "16px", fontWeight: 400, letterSpacing: "normal" },
      ],
      "caption-s-desktop": [
        "14px",
        { lineHeight: "18px", fontWeight: 400, letterSpacing: "normal" },
      ],
      "caption-s-mobile": [
        "14px",
        { lineHeight: "18px", fontWeight: 400, letterSpacing: "normal" },
      ],
      "caption-m-desktop": [
        "16px",
        { lineHeight: "22px", fontWeight: 400, letterSpacing: "normal" },
      ],
      "caption-m-mobile": [
        "16px",
        { lineHeight: "22px", fontWeight: 400, letterSpacing: "normal" },
      ],
    },
    extend: {},
  },
  corePlugins: {
    container: false,
  },
  plugins: [
    function ({ addComponents }: any) {
      addComponents({
        ".container": {
          width: "100%",
          maxWidth: "1200px",
          padding: "0 24px",
          margin: "0 auto",
          "@screen desktop": {
            maxWidth: "1200px",
          },
          "@screen tablet": {
            maxWidth: "752px",
            padding: "0 22px",
          },
          "@screen mobile": {
            maxWidth: "576px",
            padding: "0 16px",
          },
        },
      });
    },
  ],
};
export default config;
