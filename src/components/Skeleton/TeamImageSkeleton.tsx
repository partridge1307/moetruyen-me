const TeamImageSkeleton = () => {
  return (
    <div className="space-y-2">
      <p className="text-sm">Ảnh</p>
      <div className="aspect-square max-w-md rounded-full animate-pulse dark:bg-zinc-900" />
    </div>
  );
};

export default TeamImageSkeleton;
