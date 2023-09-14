import TeamImageSkeleton from './TeamImageSkeleton';

const TeamUploadSkeleton = () => {
  return (
    <div className="space-y-6 text-sm">
      <TeamImageSkeleton />

      <div className="space-y-2">
        <p>Tên</p>
        <div className="h-10 rounded-md animate-pulse dark:bg-zinc-900" />
      </div>

      <div className="space-y-2">
        <p>Mô tả</p>
        <div className="h-10 rounded-md animate-pulse dark:bg-zinc-900" />
      </div>

      <div className="h-10 rounded-md animate-pulse dark:bg-zinc-900" />
    </div>
  );
};

export default TeamUploadSkeleton;
