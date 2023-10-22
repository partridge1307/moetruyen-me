const MangaCoverSkeleton = () => {
  return (
    <div className="space-y-2">
      <p className="text-sm after:content-['*'] after:text-red-500 after:pl-0.5">
        Ảnh bìa
      </p>
      <div className="rounded-md animate-pulse aspect-[4/2] md:aspect-[4/1] dark:bg-zinc-900" />
    </div>
  );
};

export default MangaCoverSkeleton;
