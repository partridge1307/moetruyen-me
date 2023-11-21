const TeamImageSkeleton = () => {
  return (
    <div className="space-y-2">
      <p className="text-sm">Ảnh</p>
      <div className="aspect-square max-w-sm rounded-full animate-pulse bg-background" />
    </div>
  );
};

export default TeamImageSkeleton;
