import { buttonVariants } from '@/components/ui/Button';
import { TabsContent } from '@/components/ui/Tabs';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FC } from 'react';

const LeaveAction = dynamic(() => import('./LeaveAction'), { ssr: false });

interface SettingProps {
  isOwner: boolean;
}

const Setting: FC<SettingProps> = ({ isOwner }) => {
  return (
    <TabsContent
      value="setting"
      forceMount
      className="data-[state=inactive]:hidden p-2 pb-10 rounded-t-md bg-background/30"
    >
      {isOwner && (
        <Link href="/team/edit" className={buttonVariants()}>
          Chỉnh sửa
        </Link>
      )}
      {!isOwner && <LeaveAction />}
    </TabsContent>
  );
};

export default Setting;
