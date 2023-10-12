import { FC } from 'react';
import { Button, buttonVariants } from '../ui/Button';
import { MonitorDown } from 'lucide-react';
import { Icons } from '../Icons';
import { useQRCode } from 'next-qrcode';

interface QrStepperProps {
  keyUri: string;
  // eslint-disable-next-line no-unused-vars
  setActive: (value: number) => void;
}

const QrStepper: FC<QrStepperProps> = ({ keyUri, setActive }) => {
  const { Canvas } = useQRCode();

  return (
    <div>
      <p>Vui lòng làm theo hướng dẫn dưới đây:</p>

      <div className="space-y-10 my-3 mb-12">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">1, Tải Google Authenticator</h2>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://authenticator.cc/"
              target="_blank"
              className={buttonVariants({
                variant: 'ghost',
                className: 'space-x-2',
              })}
            >
              <MonitorDown />
              <span>Máy tính</span>
            </a>

            <a
              href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&pcampaignid=web_share"
              target="_blank"
              className={buttonVariants({
                variant: 'ghost',
                className: 'space-x-2',
              })}
            >
              <Icons.android className="w-6 h-6 dark:fill-white" />
              <span>Android</span>
            </a>

            <a
              href="https://apps.apple.com/vn/app/google-authenticator/id388497605"
              target="_blank"
              className={buttonVariants({
                variant: 'ghost',
                className: 'space-x-2',
              })}
            >
              <Icons.ios className="w-6 h-6 dark:fill-white" />
              <span>Ios</span>
            </a>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            2, Quét mã QR dưới đây hoặc bấm vào nút đường dẫn bên dưới{' '}
          </h2>

          {!!keyUri.length && <Canvas text={keyUri} />}

          {!!keyUri.length && (
            <a href={keyUri} target="_blank" className={buttonVariants()}>
              Đường dẫn GG Auth
            </a>
          )}
        </div>

        <h2 className="text-lg font-semibold">
          3, Chuyển đến bước tiếp theo khi đã xong các bước trên
        </h2>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setActive(2)}>Tiếp</Button>
      </div>
    </div>
  );
};

export default QrStepper;
