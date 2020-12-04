import { useCallback, useEffect, useState } from "react";
import {
  Layout,
  TextField,
  Stack,
  Checkbox,
  Spinner,
  Banner,
  List,
  Modal,
} from "@shopify/polaris";
import { useForm, useField } from "@shopify/react-form";
import { nanoid } from "nanoid";
import { withFirebase } from "./firebase";

const CreateRiceSeedModal = ({
  firebase,
  shouldOpen,
  handleModalClosed,
  handleModalDone,
  defaultRiceSeed,
}) => {
  const [locations, setLocations] = useState([]);
  const [soils, setSoils] = useState([]);
  const [weathers, setWeathers] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [stages, setStages] = useState([]);
  const [allFieldsChecked, setAllFieldsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessages, setErrorMessages] = useState([]);
  const [defaultRiceSeedData, setDefaultRiceSeedData] = useState({
    name: "",
    description: "",
    cropYields: "",
    sellPrice: "",
    buyPrice: "",
  });

  useEffect(() => {
    getAllCheckboxData();
  }, []);

  useEffect(() => {
    if (Object.values(defaultRiceSeed).length > 0) {
      setDefaultRiceSeedData(defaultRiceSeed);
      locations.forEach((location) => {
        if (defaultRiceSeed.locations.includes(location.name)) {
          location.isChecked = true;
        }
      });
      soils.forEach((soil) => {
        if (defaultRiceSeed.soils.includes(soil.name)) {
          soil.isChecked = true;
        }
      });
      weathers.forEach((weather) => {
        if (defaultRiceSeed.weathers.includes(weather.name)) {
          weather.isChecked = true;
        }
      });
      ingredients.forEach((ingredient) => {
        if (defaultRiceSeed.ingredients.includes(ingredient.title)) {
          ingredient.isChecked = true;
        }
      });
      stages.forEach((stage) => {
        if (defaultRiceSeed.stages.includes(stage.stageName)) {
          stage.isChecked = true;
        }
      });
    }
  }, [defaultRiceSeed]);

  const { fields, submit, dirty, submitting } = useForm({
    fields: {
      riceSeedName: useField({
        value: defaultRiceSeedData.name,
        validates: (riceSeedName) => {
          if (riceSeedName.trim().length < 1) {
            return "Rice seed name is required";
          }
        },
      }),
      riceSeedDescription: useField({
        value: defaultRiceSeedData.description,
        validates: (riceSeedDescription) => {
          if (riceSeedDescription.trim().length < 1) {
            return "Rice seed description is required";
          }
        },
      }),
      cropYields: useField({
        value: defaultRiceSeedData.cropYields,
        validates: (cropYield) => {
          if (cropYield.trim().length < 1) {
            return "Crop yield is required";
          }
        },
      }),
      sellPrice: useField({
        value: defaultRiceSeedData.sellPrice,
        validates: (sellPrice) => {
          if (sellPrice.trim().length < 1) {
            return "Sell price is required";
          }
        },
      }),
      buyPrice: useField({
        value: defaultRiceSeedData.buyPrice,
        validates: (buyPrice) => {
          if (buyPrice.trim().length < 1) {
            return "Buy price is required";
          }
        },
      }),
    },
    onSubmit: async (fieldValues) => {
      const docId = nanoid();
      const riceSeedLocations = {};
      const riceSeedSoils = {};
      const riceSeedWeathers = {};
      const riceSeedIngredients = [];
      const riceSeedStages = [];
      let ingredientTotalPrice = 0;
      locations.forEach((location) => {
        if (location.isChecked) {
          riceSeedLocations[location.name] = true;
        }
      });
      soils.forEach((soil) => {
        if (soil.isChecked) {
          riceSeedSoils[soil.name] = true;
        }
      });
      weathers.forEach((weather) => {
        if (weather.isChecked) {
          riceSeedWeathers[weather.name] = true;
        }
      });
      ingredients.forEach((ingredient) => {
        if (ingredient.isChecked) {
          ingredientTotalPrice += parseInt(ingredient.price);
          riceSeedIngredients.push({
            fee: {
              price: ingredient.price,
              quantity: ingredient.quantity,
              title: ingredient.title,
              unit: ingredient.unit,
            },
          });
        }
      });
      stages.forEach((stage) => {
        if (stage.isChecked) {
          delete stage.isChecked;
          riceSeedStages.push(stage);
        }
      });
      try {
        const dataToSubmit = {
          name: fields.riceSeedName.value,
          description: fields.riceSeedDescription.value,
          cropYields: fields.cropYields.value.toString(),
          sellPrice: fields.sellPrice.value,
          buyPrice: fields.buyPrice.value,
          locations: riceSeedLocations,
          soils: riceSeedSoils,
          weathers: riceSeedWeathers,
          ingredients: riceSeedIngredients,
          stages: riceSeedStages,
          ingredientTotalPrice: ingredientTotalPrice.toString(),
        };
        if (Object.values(defaultRiceSeed).length > 0) {
          await firebase.firestore
            .collection("riceSeed")
            .doc(process.env.REACT_APP_RICESEED_ID)
            .collection("data")
            .doc(defaultRiceSeed.id)
            .update({
              ...dataToSubmit,
            });
        } else {
          await firebase.firestore
            .collection("riceSeed")
            .doc(process.env.REACT_APP_RICESEED_ID)
            .collection("data")
            .doc(docId)
            .set({
              id: docId,
              ...dataToSubmit,
            });
        }
        handleModalDone();
        return { status: "success" };
      } catch (err) {
        console.error("firebase error in create rice seed", err);
        setErrorMessages([...errorMessages, "Server error occurred"]);
        return { status: "fail" };
      }
    },
  });

  const formObjectInArray = Object.values(fields);
  const hasValidationError = formObjectInArray.some((field) => {
    return field.error || field.value.trim().length < 1;
  });

  const getAllCheckboxData = async () => {
    setIsLoading(true);
    const locations = await firebase.firestore
      .collection("locations")
      .doc(process.env.REACT_APP_LOCATIONS_ID)
      .collection("data")
      .get();
    const soils = await firebase.firestore
      .collection("soil")
      .doc(process.env.REACT_APP_SOILS_ID)
      .collection("data")
      .get();
    const weathers = await firebase.firestore
      .collection("weather")
      .doc(process.env.REACT_APP_WEATHERS_ID)
      .collection("data")
      .get();
    const ingredients = await firebase.firestore
      .collection("riceSeedIngredients")
      .doc(process.env.REACT_APP_INGREDIENTS_ID)
      .collection("data")
      .get();
    const stages = await firebase.firestore
      .collection("stage")
      .doc(process.env.REACT_APP_STAGES_ID)
      .collection("data")
      .get();

    setLocations(
      locations.docs.map((location) => {
        return {
          ...location.data(),
          isChecked: false,
        };
      })
    );
    setSoils(
      soils.docs.map((soil) => {
        return {
          ...soil.data(),
          isChecked: false,
        };
      })
    );
    setWeathers(
      weathers.docs.map((weather) => {
        return {
          ...weather.data(),
          isChecked: false,
        };
      })
    );
    setIngredients(
      ingredients.docs.map((ingredient) => {
        return {
          ...ingredient.data(),
          isChecked: false,
        };
      })
    );
    setStages(
      stages.docs.map((stage) => {
        return {
          ...stage.data(),
          isChecked: false,
        };
      })
    );
    setIsLoading(false);
  };

  useEffect(() => {
    const isLocationSelected =
      locations.filter((type) => type.isChecked).length > 0;
    const isSoilSelected = soils.filter((type) => type.isChecked).length > 0;
    const isWeatherSelected =
      weathers.filter((type) => type.isChecked).length > 0;
    const isIngredientSelected =
      ingredients.filter((type) => type.isChecked).length > 0;
    const isStageSelected = stages.filter((type) => type.isChecked).length > 0;
    if (
      isLocationSelected &&
      isSoilSelected &&
      isWeatherSelected &&
      isIngredientSelected &&
      isStageSelected
    ) {
      setAllFieldsChecked(true);
    }
  }, [locations, soils, weathers, ingredients, stages]);

  const handleCheckboxesChange = useCallback(
    (newCheck, id, type) => {
      let clonedData;
      switch (type) {
        case "locations":
          clonedData = [...locations];
          break;
        case "soils":
          clonedData = [...soils];
          break;
        case "weathers":
          clonedData = [...weathers];
          break;
        case "ingredients":
          clonedData = [...ingredients];
          break;
        case "stages":
          clonedData = [...stages];
          break;
        default:
          clonedData = [];
          break;
      }
      let index = clonedData.findIndex((type) => type.id === id);
      clonedData[index].isChecked = newCheck;
      switch (type) {
        case "locations":
          setLocations(clonedData);
          break;
        case "soils":
          setSoils(clonedData);
          break;
        case "weathers":
          setWeathers(clonedData);
          break;
        case "ingredients":
          setIngredients(clonedData);
          break;
        case "stages":
          setStages(clonedData);
          break;
        default:
          clonedData = [];
          break;
      }
    },
    [locations, soils, weathers, ingredients, stages]
  );

  const locationsCheckboxes = (
    <Stack vertical>
      <Stack.Item>
        <Stack distribution="fillEvenly">
          {locations.map((location, index) => (
            <Stack.Item key={index}>
              <Checkbox
                id={location.id}
                label={location.name}
                checked={location.isChecked}
                onChange={(newCheck, id) =>
                  handleCheckboxesChange(newCheck, id, "locations")
                }
              />
            </Stack.Item>
          ))}
        </Stack>
      </Stack.Item>
    </Stack>
  );

  const soilsCheckboxes = (
    <Stack vertical>
      <Stack.Item>
        <Stack distribution="fillEvenly">
          {soils.map((soil, index) => (
            <Stack.Item key={index}>
              <Checkbox
                id={soil.id}
                label={soil.name}
                checked={soil.isChecked}
                onChange={(newCheck, id) =>
                  handleCheckboxesChange(newCheck, id, "soils")
                }
              />
            </Stack.Item>
          ))}
        </Stack>
      </Stack.Item>
    </Stack>
  );

  const weathersCheckboxes = (
    <Stack vertical>
      <Stack.Item>
        <Stack distribution="fillEvenly">
          {weathers.map((weather, index) => (
            <Stack.Item key={index}>
              <Checkbox
                id={weather.id}
                label={weather.name}
                checked={weather.isChecked}
                onChange={(newCheck, id) =>
                  handleCheckboxesChange(newCheck, id, "weathers")
                }
              />
            </Stack.Item>
          ))}
        </Stack>
      </Stack.Item>
    </Stack>
  );

  const ingredientsCheckboxes = (
    <Stack vertical>
      <Stack.Item>
        <Stack distribution="fillEvenly">
          {ingredients.map((ingredient, index) => (
            <Stack.Item key={index}>
              <Checkbox
                id={ingredient.id}
                label={ingredient.title}
                checked={ingredient.isChecked}
                onChange={(newCheck, id) =>
                  handleCheckboxesChange(newCheck, id, "ingredients")
                }
              />
            </Stack.Item>
          ))}
        </Stack>
      </Stack.Item>
    </Stack>
  );

  const stagesCheckboxes = (
    <Stack vertical>
      <Stack.Item>
        <Stack distribution="fillEvenly">
          {stages.map((stage, index) => (
            <Stack.Item key={index}>
              <Checkbox
                id={stage.id}
                label={stage.stageName}
                checked={stage.isChecked}
                onChange={(newCheck, id) =>
                  handleCheckboxesChange(newCheck, id, "stages")
                }
              />
            </Stack.Item>
          ))}
        </Stack>
      </Stack.Item>
    </Stack>
  );

  const errorMessagesBanner = errorMessages.length > 0 && (
    <Banner title="Errors" status="critical">
      <List type="bullet">
        {errorMessages.map((message, index) => (
          <List.Item key={index}>{message}</List.Item>
        ))}
      </List>
    </Banner>
  );

  const modalContent =
    Object.values(defaultRiceSeed).length > 0
      ? "Update Rice seed"
      : "Create Rice seed";

  return (
    <Modal
      title={modalContent}
      open={shouldOpen}
      onClose={handleModalClosed}
      primaryAction={{
        content: modalContent,
        onAction: submit,
        disabled:
          (!dirty && !Object.values(defaultRiceSeed).length > 0) ||
          submitting ||
          hasValidationError ||
          !allFieldsChecked,
        loading: submitting,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: handleModalClosed,
        },
      ]}
      large
    >
      {!isLoading ? (
        <Modal.Section>
          {errorMessagesBanner}
          <Layout>
            <Layout.AnnotatedSection title="Rice seed name">
              <TextField {...fields.riceSeedName} />
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection title="Rice seed description">
              <TextField {...fields.riceSeedDescription} />
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection title="Rice seed locations">
              {locationsCheckboxes}
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection title="Rice seed soils">
              {soilsCheckboxes}
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection title="Rice seed weathers">
              {weathersCheckboxes}
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection title="Rice seed ingredients">
              {ingredientsCheckboxes}
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection title="Rice seed stages">
              {stagesCheckboxes}
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection title="Rice seed crop yields">
              <TextField {...fields.cropYields} type="number" />
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection title="Rice seed sell price">
              <TextField {...fields.sellPrice} type="number" step="0.1" />
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection title="Rice seed buy price">
              <TextField {...fields.buyPrice} type="number" step="0.1" />
            </Layout.AnnotatedSection>
          </Layout>
        </Modal.Section>
      ) : (
        <Spinner />
      )}
    </Modal>
  );
};

export default withFirebase(CreateRiceSeedModal);
