import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  from,
  split,
} from "@apollo/client";

import { WebSocketLink } from "@apollo/client/link/ws";
import { createUploadLink } from "apollo-upload-client";
import { getMainDefinition } from "@apollo/client/utilities";
import includes from "lodash/includes";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { useMemo } from "react";
import { useNavigation } from "@react-navigation/core";

const API_URL = "192.168.2.26:3999";
// @ts-ignore
let apolloClient: ApolloClient;

function createApolloClient() {
  const urlFromJson = API_URL;

  const useHttps = false;

  const devBaseUrl = `://${urlFromJson}/graphql`;
  const backendUrl = `http${useHttps ? "s" : ""}${devBaseUrl}`;

  const wsUrl = `ws${useHttps ? "s" : ""}${devBaseUrl}`;

  console.log("api", backendUrl);

  const wsLink = new WebSocketLink({
    // if you instantiate in the server, the error will be thrown
    uri: wsUrl,
    options: {
      reconnect: true,
    },
  });

  // Log any GraphQL errors or network error that occurred
  const errorLink = onError(
    ({ graphQLErrors, networkError, operation, response }) => {
      try {
        if (graphQLErrors && graphQLErrors.forEach) {
          // Not Authorised!
          graphQLErrors.map(({ message, locations, path, originalError }) => {
            console.error("originalError", {
              message,
              originalError,
              locations,
              path,
            });
            // not authorized
            // if (includes(message, 'Expired')) {
            //   // Refresh to token from here
            //   // authHelper
            //   //   .refreshToken()
            //   //   .then(accessToken => {
            //   //     log.info('Got new refresh token', getLastChar(accessToken));
            //   //     return AsyncStorageDB.Instance.updateUserAuth({
            //   //       accessToken,
            //   //     });
            //   //   })
            //   //   .then(updatedUser => {
            //   //     log.error('updatedUser refresh token', updatedUser);
            //   //   })
            //   //   .catch(error => {
            //   //     log.error('error updatedUser refresh token', error);
            //   //   });

            //   // log.error('Error when refreshing TOKEN', message);
            // }
            if (includes(message.toLocaleLowerCase(), "not authenticated")) {
              // Ask user to login again
              // events.emit(APPEVENTS.LOGOUT, null); // emit logout
            }
          });

          // @ts-ignore
          response.errors = null; // ignore errors
        }
      } catch (error) {
        // console.error('error with graphql', error);
      }
    }
  );

  const tcpLink = split(({ query }) => {
    // @ts-ignore
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  }, wsLink);

  const link = from([
    tcpLink,
    errorLink,
    createUploadLink({
      uri: backendUrl,
    }),
  ]);

  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
}

export function initializeApollo(initialState = {}) {
  const _apolloClient = apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();
    // Restore the cache using the data passed from getStaticProps/getServerSideProps
    // combined with the existing cached data
    _apolloClient.cache.restore({ ...existingCache, ...initialState });
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function useApollo(initialState?: ApolloClient<any>) {
  const store = useMemo(() => initializeApollo(initialState), [initialState]);
  return store;
}

export function useNavigate() {
  const navigation = useNavigation();

  const navigate = async (back: boolean) => {
    if (back) {
      const canGoBack = navigation.canGoBack();
      if (canGoBack) {
        return navigation.goBack();
      }
      return null;
    }

    return navigation.navigate;
  };

  return navigate;
}
