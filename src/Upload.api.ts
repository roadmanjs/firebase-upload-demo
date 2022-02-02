import {
  MediaDataType,
  UPLOAD_FILES_MUTATION,
} from "@roadmanjs/firebase-client";

import { ApolloClient } from "@apollo/client";
import _get from "lodash/get";

interface DataResponse {
  data?: MediaDataType[];
}

export const uploadFilesApi = async ({
  files,
  client,
}: {
  files: File[];
  client: ApolloClient<any>;
}): Promise<MediaDataType[]> => {
  // console.log('portfolios are', JSON.stringify(args));

  try {
    const userId = "ceddymuhoza";

    const { data: dataResponse }: any = await client.mutate({
      mutation: UPLOAD_FILES_MUTATION,
      variables: {
        owner: userId,
        files,
      },
      fetchPolicy: "no-cache",
    });

    if (!dataResponse) {
      throw new Error("error getting portfolio data");
    }

    const { data }: { data?: MediaDataType[] } = dataResponse;

    console.log(`data response images ${data && data.length}`);

    if (data) {
      //   Successful

      console.log(`portfolios data is successful ${data && data.length}`);
      return data;
    }
    throw new Error("error getting portfolios data, please try again later");
  } catch (err) {
    throw err;
  }
};
