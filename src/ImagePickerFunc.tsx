import * as ImagePicker from "expo-image-picker";

import {
    ActivityIndicator,
    Button,
    Image,
    LogBox,
    Platform,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    View
} from "react-native";

import React from "react";
import { uploadFilesApi } from "./Upload.api";
import { useApolloClient } from "@apollo/client";

// Firebase sets some timeers for a long period, which will trigger some warnings. Let's turn that off for this example
LogBox.ignoreLogs([`Setting a timer for a long period`]);


export const UploadComponent = () => {

    const client = useApolloClient()

    const [state, setState] = React.useState<{
        image?: string;
        uploading: boolean;
    }>({
        uploading: false,
    });

    const { image, uploading } = state;

    async function uploadImageAsync(uri: string) {
        // TODO already have for web
        // TODO do this fix for mobile to get the actual file blob from the xhr request, then forward it to graphql mutation
        // Why are we using XMLHttpRequest? See:
        // https://github.com/expo/expo/issues/2402#issuecomment-443726662

        // TODO this implementation works for both web and mobile, super sick
        const blob: any = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function (e) {
                console.log(e);
                reject(new TypeError("Network request failed"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", uri, true);
            xhr.send(null);
        });

       
        console.log("resolved blog", blob);

        const uploaded = await uploadFilesApi({ files: [{ uri, mimetype: blob.type, filename: "blob" }], client })

        console.log("uploaded is ", uploaded);
        
    }

    const _maybeRenderUploadingOverlay = () => {
        if (uploading) {
            return (
                <View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: "rgba(0,0,0,0.4)",
                            alignItems: "center",
                            justifyContent: "center",
                        },
                    ]}
                >
                    <ActivityIndicator color="#fff" animating size="large" />
                </View>
            );
        }
    };

    const _maybeRenderImage = () => {
        if (!image) {
            return;
        }

        return (
            <View
                style={{
                    marginTop: 30,
                    width: 250,
                    borderRadius: 3,
                    elevation: 2,
                }}
            >
                <View
                    style={{
                        borderTopRightRadius: 3,
                        borderTopLeftRadius: 3,
                        shadowColor: "rgba(0,0,0,1)",
                        shadowOpacity: 0.2,
                        shadowOffset: { width: 4, height: 4 },
                        shadowRadius: 5,
                        overflow: "hidden",
                    }}
                >
                    <Image source={{ uri: image }} style={{ width: 250, height: 250 }} />
                </View>
            </View>
        );
    };


    const _takePhoto = async () => {
        let pickerResult = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
        });

        _handleImagePicked(pickerResult);
    };

    const _pickImage = async () => {
        let pickerResult = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
        });

        console.log({ pickerResult });

        _handleImagePicked(pickerResult);
    };

    const _handleImagePicked = async (pickerResult: ImagePicker.ImagePickerResult) => {
        try {
            setState({ ...state, uploading: true });

            if (!pickerResult.cancelled) {
                const uploadUrl = await uploadImageAsync(pickerResult.uri);
                // TODO when done setState({ ...state, image: uploadUrl });
            }
        } catch (e) {
            console.log(e);
            alert("Upload failed, sorry :(");
        }
    };

    React.useEffect(() => {
        const runDidMount = async () => {
            if (Platform.OS !== "web") {
                const {
                    status,
                } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== "granted") {
                    alert("Sorry, we need camera roll permissions to make this work!");
                }
            }
        }

        runDidMount();

    })



    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            {!!image && (
                <Text
                    style={{
                        fontSize: 20,
                        marginBottom: 20,
                        textAlign: "center",
                        marginHorizontal: 15,
                    }}
                >
                    Example: Upload ImagePicker result
                </Text>
            )}

            <Button
                onPress={_pickImage}
                title="Pick an image from camera roll"
            />

            <Button onPress={_takePhoto} title="Take a photo" />

            {_maybeRenderImage()}
            {_maybeRenderUploadingOverlay()}

            <StatusBar barStyle="default" />
        </View>
    );
}

