import { useEffect, useState } from "react";

interface useDebounceProps {
  delay: number;
  callback: (value: string) => Promise<void>;
}

const useDebounce = (props: useDebounceProps) => {
  const { delay, callback } = props;
  const [value, setValue] = useState("");

  useEffect(() => {
    const runOnChange = setTimeout(async () => {
      await callback(value);
    }, delay);

    return () => clearTimeout(runOnChange);
  }, [value]);

  return { value, setValue };
};

export default useDebounce;
