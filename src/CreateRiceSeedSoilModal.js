import { withFirebase } from "./firebase";
import { Modal, Layout, TextField, Banner, List } from "@shopify/polaris";
import { useForm, useField } from "@shopify/react-form";
import { nanoid } from "nanoid";
import { useState, useEffect } from "react";

const CreateRiceSeedSoilModal = ({
  firebase,
  shouldOpen,
  handleModalClosed,
  handleModalDone,
  defaultRiceSeedSoil,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [defaultRiceSeedSoilData, setDefaultRiceSeedSoilData] = useState({
    name: "",
    description: "",
  });
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    if (Object.values(defaultRiceSeedSoil).length > 0) {
      setDefaultRiceSeedSoilData(defaultRiceSeedSoil);
    }
  }, [defaultRiceSeedSoil]);

  const { fields, submit, submitting, dirty } = useForm({
    fields: {
      name: useField({
        value: defaultRiceSeedSoilData.name,
        validates: (name) => {
          if (name.trim().length < 1) {
            return "Name field is required";
          }
        },
      }),
      description: useField({
        value: defaultRiceSeedSoilData.description,
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
        if (Object.values(defaultRiceSeedSoil).length > 0) {
          await firebase.firestore
            .collection("soil")
            .doc(process.env.REACT_APP_SOILS_ID)
            .collection("data")
            .doc(defaultRiceSeedSoil.id)
            .update(data);
        } else {
          await firebase.firestore
            .collection("soil")
            .doc(process.env.REACT_APP_SOILS_ID)
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
        console.error("firebase error in create rice seed soil", err);
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
    Object.values(defaultRiceSeedSoil).length > 0
      ? "Update Rice Seed Soil"
      : "Create Rice Seed Soil";

  return (
    <Modal
      title={modalBtnContent}
      open={shouldOpen}
      onClose={handleModalClosed}
      primaryAction={{
        content: modalBtnContent,
        onAction: submit,
        disabled:
          (!dirty && !Object.values(defaultRiceSeedSoil).length > 0) ||
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
          <Layout.AnnotatedSection title="Rice Seed Soil Name">
            <TextField {...fields.name} />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection title="Rice Seed Soil Description">
            <TextField {...fields.description} />
          </Layout.AnnotatedSection>
        </Layout>
      </Modal.Section>
    </Modal>
  );
};

export default withFirebase(CreateRiceSeedSoilModal);
