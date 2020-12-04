import { withFirebase } from "./firebase";
import {
  Page,
  Frame,
  Toast,
  Card,
  ResourceList,
  ResourceItem,
  TextStyle,
  Button,
} from "@shopify/polaris";
import { useState, useEffect, useCallback } from "react";
import { useForm, useField } from "@shopify/react-form";
import CreateRiceSeedIngredientModal from "./CreateRiceSeedIngredientModal";
import DeleteModal from "./DeleteModal";

const ManageRiceSeedIngredients = ({ firebase }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [riceSeedIngredients, setRiceSeedIngredients] = useState([]);
  const [shouldModalOpen, setShouldModalOpen] = useState(false);
  const [ingredientToBeEdited, setIngredientToBeEdited] = useState({});
  const [ingredientToBeDeleted, setIngredientToBeDeleted] = useState({});
  const [toastInfo, setToastInfo] = useState({
    content: "",
    error: false,
    duration: 2500,
  });
  const [showToast, setShowToast] = useState(false);
  const [shouldDeleteModalOpen, setShouldDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    getRiceSeedIngredients();
  }, []);

  const getRiceSeedIngredients = useCallback(async () => {
    setIsLoading(true);
    const ingredients = await firebase.firestore
      .collection("riceSeedIngredients")
      .doc(process.env.REACT_APP_INGREDIENTS_ID)
      .collection("data")
      .get();
    setRiceSeedIngredients(
      ingredients.docs.map((ingredient) => ingredient.data())
    );
    setIsLoading(false);
  }, []);

  const displayToast = useCallback(
    (content, error = false, duration = 2500) => {
      setToastInfo({ ...toastInfo, content, error, duration });
      setShowToast(true);
    },
    [toastInfo]
  );

  const handleDismissToast = useCallback(() => {
    setShowToast(false);
  }, []);

  const handleAddRiceSeedIngredientButtonClicked = useCallback(() => {
    setShouldModalOpen(true);
  }, []);

  const handleModalClosed = useCallback(() => {
    setShouldModalOpen(false);
    setIngredientToBeEdited({});
  }, []);

  const handleEditRiceSeedIngredient = useCallback((item) => {
    setIngredientToBeEdited(item);
    setShouldModalOpen(true);
  }, []);

  const handleDeleteRiceSeedIngredient = useCallback((item) => {
    setIngredientToBeDeleted(item);
    setShouldDeleteModalOpen(true);
  }, []);

  const handleDeleteModalClosed = useCallback(() => {
    setShouldDeleteModalOpen(false);
  }, []);

  const handleDeleteModalDone = useCallback(async () => {
    setIsDeleting(true);
    await firebase.firestore
      .collection("riceSeedIngredients")
      .doc(process.env.REACT_APP_INGREDIENTS_ID)
      .collection("data")
      .doc(ingredientToBeDeleted.id)
      .delete();
    setShouldDeleteModalOpen(false);
    getRiceSeedIngredients();
    displayToast("Ingredient deleted successfully!");
    setIsDeleting(false);
  }, [ingredientToBeDeleted]);

  const resourceListHeaders = (
    <table className="table-container" role="table" aria-label="Rice seeds">
      <thead>
        <tr className="flex-table header" role="rowgroup">
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Ingredient Title</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Ingredient price</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Ingredient quantity</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Unit</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <Button primary onClick={handleAddRiceSeedIngredientButtonClicked}>
              Add Rice Seed Ingredient
            </Button>
          </th>
        </tr>
      </thead>
    </table>
  );

  const renderItem = useCallback((item, id) => {
    return (
      <ResourceItem id={id} onClick={() => {}}>
        <table className="table-container">
          <tbody>
            <tr className="flex-table row" role="rowgroup">
              <td className="flex-row" role="cell">
                {item.title}
              </td>
              <td className="flex-row" role="cell">
                {item.price}
              </td>
              <td className="flex-row" role="cell">
                {item.quantity}
              </td>
              <td className="flex-row" role="cell">
                {item.unit}
              </td>
              <td className="flex-row" role="cell">
                <div
                  style={{
                    marginRight: ".8rem",
                    display: "inline",
                  }}
                >
                  <Button
                    plain
                    onClick={() => {
                      handleEditRiceSeedIngredient(item);
                    }}
                  >
                    Edit
                  </Button>
                </div>
                <Button
                  plain
                  destructive
                  onClick={() => {
                    handleDeleteRiceSeedIngredient(item);
                  }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </ResourceItem>
    );
  }, []);

  return (
    <Page fullWidth>
      <Frame>
        {showToast && <Toast {...toastInfo} onDismiss={handleDismissToast} />}
        <Card>
          <ResourceList
            loading={isLoading}
            filterControl={resourceListHeaders}
            items={riceSeedIngredients}
            renderItem={renderItem}
          />
          <CreateRiceSeedIngredientModal
            shouldOpen={shouldModalOpen}
            handleModalClosed={handleModalClosed}
            handleModalDone={() => {
              setShouldModalOpen(false);
              getRiceSeedIngredients();
            }}
            defaultRiceSeedIngredient={ingredientToBeEdited}
          />
          <DeleteModal
            shouldOpen={shouldDeleteModalOpen}
            handleModalClosed={handleDeleteModalClosed}
            title="Delete Rice Seed Ingredient"
            isDeleting={isDeleting}
            handlePrimaryActionClicked={handleDeleteModalDone}
          />
        </Card>
      </Frame>
    </Page>
  );
};

export default withFirebase(ManageRiceSeedIngredients);
