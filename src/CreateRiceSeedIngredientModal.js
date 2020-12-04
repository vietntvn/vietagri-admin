import { withFirebase } from "./firebase";
import { Modal, Layout, TextField, Banner, List } from "@shopify/polaris";
import { useForm, useField } from "@shopify/react-form";
import { nanoid } from "nanoid";
import { useState, useEffect } from "react";

const CreateRiceSeedIngredientModal = ({
  firebase,
  shouldOpen,
  handleModalClosed,
  handleModalDone,
  defaultRiceSeedIngredient,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [
    defaultRiceSeedIngredientData,
    setDefaultRiceSeedIngredientData,
  ] = useState({
    title: "",
    price: "",
    quantity: "",
    unit: "",
  });
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    if (Object.values(defaultRiceSeedIngredient).length > 0) {
      setDefaultRiceSeedIngredientData(defaultRiceSeedIngredient);
    }
  }, [defaultRiceSeedIngredient]);

  const { fields, submit, submitting, dirty } = useForm({
    fields: {
      title: useField({
        value: defaultRiceSeedIngredientData.title,
        validates: (title) => {
          if (title.trim().length < 1) {
            return "Title field is required";
          }
        },
      }),
      price: useField({
        value: defaultRiceSeedIngredientData.price,
        validates: (price) => {
          if (price.trim().length < 1) {
            return "Price field is required";
          }
        },
      }),
      quantity: useField({
        value: defaultRiceSeedIngredientData.quantity,
        validates: (quantity) => {
          if (quantity.trim().length < 1) {
            return "Quantity field is required";
          }
        },
      }),
      unit: useField({
        value: defaultRiceSeedIngredientData.unit,
        validates: (unit) => {
          if (unit.trim().length < 1) {
            return "Unit field is required";
          }
        },
      }),
    },
    onSubmit: async (fieldValues) => {
      setIsLoading(true);
      const docId = nanoid();
      try {
        const data = {
          title: fields.title.value,
          price: fields.price.value,
          quantity: fields.quantity.value,
          unit: fields.unit.value,
        };
        if (Object.values(defaultRiceSeedIngredient).length > 0) {
          await firebase.firestore
            .collection("riceSeedIngredients")
            .doc(process.env.REACT_APP_INGREDIENTS_ID)
            .collection("data")
            .doc(defaultRiceSeedIngredient.id)
            .update(data);
        } else {
          await firebase.firestore
            .collection("riceSeedIngredients")
            .doc(process.env.REACT_APP_INGREDIENTS_ID)
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
        console.error("firebase error in create rice seed ingredient", err);
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
    Object.values(defaultRiceSeedIngredient).length > 0
      ? "Update Rice Seed Ingredient"
      : "Create Rice Seed Ingredient";

  return (
    <Modal
      title={modalBtnContent}
      open={shouldOpen}
      onClose={handleModalClosed}
      primaryAction={{
        content: modalBtnContent,
        onAction: submit,
        disabled:
          (!dirty && !Object.values(defaultRiceSeedIngredient).length > 0) ||
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
          <Layout.AnnotatedSection title="Rice Seed Ingredient Title">
            <TextField {...fields.title} />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection title="Rice Seed Ingredient Price">
            <TextField {...fields.price} type="number" step="0.1" />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection title="Rice Seed Ingredient Quantity">
            <TextField {...fields.quantity} type="number" />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection title="Unit">
            <TextField {...fields.unit} />
          </Layout.AnnotatedSection>
        </Layout>
      </Modal.Section>
    </Modal>
  );
};

export default withFirebase(CreateRiceSeedIngredientModal);
