import { withFirebase } from "./firebase";
import { Modal, Layout, TextField, Banner, List } from "@shopify/polaris";
import { useForm, useField } from "@shopify/react-form";
import { nanoid } from "nanoid";
import { useState, useEffect } from "react";

const CreateRiceSeedWeatherModal = ({
  firebase,
  shouldOpen,
  handleModalClosed,
  handleModalDone,
  defaultRiceSeedWeather,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [defaultRiceSeedWeatherData, setDefaultRiceSeedWeatherData] = useState({
    name: "",
    description: "",
  });
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    if (Object.values(defaultRiceSeedWeather).length > 0) {
      setDefaultRiceSeedWeatherData(defaultRiceSeedWeather);
    }
  }, [defaultRiceSeedWeather]);

  const { fields, submit, submitting, dirty } = useForm({
    fields: {
      name: useField({
        value: defaultRiceSeedWeatherData.name,
        validates: (name) => {
          if (name.trim().length < 1) {
            return "Name field is required";
          }
        },
      }),
      description: useField({
        value: defaultRiceSeedWeatherData.description,
        validates: (description) => {
          if (description.trim().length < 1) {
            return "Description field is required";
          }
        },
      }),
    },
    onSubmit: async (fieldValues) => {
      setIsLoading(true);
      const docId = nanoid();
      try {
        const data = {
          name: fields.name.value,
          description: fields.description.value,
        };
        if (Object.values(defaultRiceSeedWeather).length > 0) {
          await firebase.firestore
            .collection("weather")
            .doc(process.env.REACT_APP_WEATHERS_ID)
            .collection("data")
            .doc(defaultRiceSeedWeather.id)
            .update(data);
        } else {
          await firebase.firestore
            .collection("weather")
            .doc(process.env.REACT_APP_WEATHERS_ID)
            .collection("data")
            .doc(docId)
            .set({
              id: docId,
              ...data,
            });
        }
        setIsLoading(false);
        handleModalDone();
        return { status: "success" };
      } catch (err) {
        setIsLoading(false);
        console.error("firebase error in create rice seed weather", err);
        setErrorMessages([...errorMessages, "Server error occurred"]);
        return { status: "fail" };
      }
    },
  });

  const formObjectInArray = Object.values(fields);
  const hasValidationError = formObjectInArray.some((field) => {
    return field.error || field.value.trim().length < 1;
  });

  const errorMessagesBanner = errorMessages.length > 0 && (
    <Banner title="Errors" status="critical">
      <List type="bullet">
        {errorMessages.map((message, index) => (
          <List.Item key={index}>{message}</List.Item>
        ))}
      </List>
    </Banner>
  );

  const modalBtnContent =
    Object.values(defaultRiceSeedWeather).length > 0
      ? "Update Rice Seed Weather"
      : "Create Rice Seed Weather";

  return (
    <Modal
      title={modalBtnContent}
      open={shouldOpen}
      onClose={handleModalClosed}
      primaryAction={{
        content: modalBtnContent,
        onAction: submit,
        disabled:
          (!dirty && !Object.values(defaultRiceSeedWeather).length > 0) ||
          hasValidationError,
        loading: isLoading,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: handleModalClosed,
        },
      ]}
      large
    >
      <Modal.Section>
        {errorMessagesBanner}
        <Layout>
          <Layout.AnnotatedSection title="Rice Seed Soil Weather">
            <TextField {...fields.name} />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection title="Rice Seed Soil Weather">
            <TextField {...fields.description} />
          </Layout.AnnotatedSection>
        </Layout>
      </Modal.Section>
    </Modal>
  );
};

export default withFirebase(CreateRiceSeedWeatherModal);
