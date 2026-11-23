type Props = {
  title: string;
};

export const Header = ({ title }: Props) => {
  return (
    <div className="sticky top-0 bg-white dark:bg-slate-900 pb-3 lg:pt-[28px] lg:mt-[-28px] flex items-center justify-between border-b-2 mb-5 text-neutral-400 lg:z-50">
      <h1 className="font-bold text-lg text-slate-800 dark:text-white">
        {title}
      </h1>
    </div>
  );
};
