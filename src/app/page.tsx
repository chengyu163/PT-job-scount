import SearchBar from "@/components/SearchBar";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Job Scout Portugal
        </h1>
        <p className="mt-4 text-xl text-zinc-500 dark:text-zinc-400">
          签约之前，先看清楚
        </p>
        <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
          AI 驱动的葡萄牙公司情报工具，覆盖 IT 与商科领域
        </p>
      </div>

      <SearchBar />

      <div className="mt-16 grid max-w-2xl grid-cols-1 gap-8 text-center sm:grid-cols-3">
        <div>
          <div className="mb-2 text-3xl">&#128270;</div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            多平台数据聚合
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            整合 Teamlyzer、Glassdoor、LinkedIn 等多个平台
          </p>
        </div>
        <div>
          <div className="mb-2 text-3xl">&#9888;&#65039;</div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            红旗交叉检测
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            AI 跨平台交叉验证，识别反复出现的问题
          </p>
        </div>
        <div>
          <div className="mb-2 text-3xl">&#127757;</div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            外国人友好度
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            签证支持、英语环境、搬迁补助一目了然
          </p>
        </div>
      </div>
    </div>
  );
}
