import React from "react";
import Markdown from "markdown-to-jsx";
import MarkdownTagA from "./markdown-tag/MarkdownTagA";
import MarkdownTagUl from "./markdown-tag/MarkdownTagUl";
import Image from "next/image";

interface Props {
  content: string;
}

// Предобработка приходящего с бека сырого markdown
function fixMarkdown(markdown: string): string {
  // Заменяет дефис (короткое тире) на длинное тире
  // markdown-to-jsx считает что дефис в середине текста это список, это ломает семантику, сломанная семантика не рендерится на беке нормально,
  // в итоге, получаем ошибку гидрации: https://sentry.skyeng.tech/organizations/skyeng/issues/9050348/?project=628&query=is%3Aunresolved&referrer=issue-stream
  markdown = markdown.replaceAll(" - ", " – ");

  /**
   * Для markdown-to-jsx важно, чтобы перед код блоком был перенос строки, иначе блок кода не будет распарсен
   *
   * пример ошибки: /python/udalenie-pervykh-strok-iz-data-frame-v-pandas-metody/
   */
  markdown = markdown.replaceAll("```", "\n```");

  /**
   * Заменяет [1. на [1\. чтобы markdown-to-jsx не считал цифры внутри ссылок списоком.
   *
   * Списки внутри ссылок ломают разметку:
   * https://github.com/quantizor/markdown-to-jsx/issues/285,
   *
   * пример ошибки: python/filter-i-filter-by-v-sql-alchemy-vybor-i-pravilnoe-ispolzovanie/
   */
  markdown = markdown.replace(/\[(\d+)\./g, "[$1\\.");

  return markdown;
}

const MarkdownContent: React.FC<Props> = ({ content }) => {
  return (
    <>
      <Markdown
        options={{
          disableParsingRawHTML: true,
          overrides: {
            a: MarkdownTagA,
            ul: { component: MarkdownTagUl },
            h1: {
              props: {
                className: "heading-l mb-16",
                "data-test": "заголовок статьи",
              },
            },
            h2: {
              props: {
                className: "heading-m mb-16 mt-32",
              },
            },
            h3: {
              props: {
                className: "heading-xs mb-12 mt-16",
              },
            },
            h4: {
              props: {
                className: "heading-xxs mb-8 mt-12",
              },
            },
            p: {
              props: {
                className: "text-l mt-12",
              },
            },
            ol: {
              props: {
                className: "text-l list-decimal pl-20",
              },
            },
            strong: {
              props: {
                className: "font-semibold",
              },
            },
            em: {
              props: {
                className: "text-l not-italic px-8 pb-2 rounded bg-brand-light",
              },
            },
            li: {
              props: {
                className: "relative my-8",
              },
            },
            img: {
              component(props) {
                return (
                  <Image
                    src={props.src}
                    alt={props.alt}
                    width={1200}
                    height={600}
                  ></Image>
                );
              },
            },
          },
        }}
      >
        {fixMarkdown(content)}
      </Markdown>
    </>
  );
};

export default MarkdownContent;
