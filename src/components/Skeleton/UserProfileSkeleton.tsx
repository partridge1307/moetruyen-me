const UserProfileSkeleton = () => {
  return (
    <div>
      <div className="relative">
        <div className="aspect-video rounded-md animate-pulse dark:bg-zinc-900" />
        <div className="absolute bottom-0 translate-y-1/2 left-4 aspect-square w-28 h-28 lg:w-36 lg:h-36 rounded-full border-4 dark:border-zinc-800 animate-pulse dark:bg-zinc-900" />
      </div>

      <div className="mt-20 lg:mt-28 space-y-10">
        <div className="space-y-1">
          <p>Tên</p>
          <div className="h-10 rounded-md animate-pulse dark:bg-zinc-900" />
        </div>

        <div>
          <p>Huy hiệu</p>
          <div className="h-10 rounded-md animate-pulse dark:bg-zinc-900" />
        </div>

        <div className="py-10 pb-20 flex flex-wrap items-center gap-6">
          <div className="w-40 h-12 rounded-md animate-pulse dark:bg-zinc-900" />
          <div className="w-40 h-12 rounded-md animate-pulse dark:bg-zinc-900" />
          <div className="w-40 h-12 rounded-md animate-pulse dark:bg-zinc-900" />
          <div className="w-40 h-12 rounded-md animate-pulse dark:bg-zinc-900" />
          <div className="w-40 h-12 rounded-md animate-pulse dark:bg-zinc-900" />
        </div>
      </div>
    </div>
  );
};

export default UserProfileSkeleton;
