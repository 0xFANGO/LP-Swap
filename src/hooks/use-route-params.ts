import { useParams } from "react-router";

const useRouteParams = () => {
  const params = useParams();
  return params;
};

export default useRouteParams;
