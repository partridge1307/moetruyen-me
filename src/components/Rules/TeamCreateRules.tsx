const TeamCreateRules = () => {
  return (
    <section className="space-y-4 p-3 rounded-md dark:bg-zinc-900/60">
      <h1 className="text-lg lg:text-xl font-semibold">Quy ước</h1>

      <div>
        <h2 className="text-lg font-medium">Ảnh</h2>
        <ol className="list-decimal list-inside">
          <li>
            Ảnh phải <span className="font-semibold">dưới 4MB</span>
          </li>
          <li>
            Ảnh phải là định dạng <span className="font-semibold">JPG</span>
            {', '}
            <span className="font-semibold">JPEG</span>
            {', '}
            <span className="font-semibold">PNG</span>
          </li>
        </ol>
      </div>

      <div>
        <h2 className="text-lg font-medium">Tên Team</h2>
        <ol className="list-decimal list-inside">
          <li>
            Tên tối thiểu <span className="font-semibold">3</span> kí tự, tối đa{' '}
            <span className="font-semibold">64</span> kí tự
          </li>
          <li>
            Tên phải thuộc <span className="font-semibold">Alphanumeric</span>,{' '}
            <span className="font-semibold">tiếng Việt</span>,{' '}
            <span className="font-semibold">khoảng trống</span>
          </li>
        </ol>
      </div>

      <div>
        <h2 className="text-lg font-medium">Mô tả</h2>
        <ol className="list-decimal list-inside">
          <li>
            Tối thiểu <span className="font-semibold">5</span> kí tự, tối đa{' '}
            <span className="font-semibold">255</span> kí tự
          </li>
        </ol>
      </div>
    </section>
  );
};

export default TeamCreateRules;
