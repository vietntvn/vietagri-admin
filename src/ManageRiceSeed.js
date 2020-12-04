import { useCallback, useEffect, useState } from "react";
import {
  Frame,
  Layout,
  TextField,
  Page,
  Button,
  Stack,
  Checkbox,
  Toast,
  Spinner,
  ResourceList,
  ResourceItem,
  TextStyle,
  Card,
} from "@shopify/polaris";
import { useForm, useField } from "@shopify/react-form";
import { nanoid } from "nanoid";
import { withFirebase } from "./firebase";
import CreateRiceSeedModal from "./CreateRiceSeedModal";
import DeleteModal from "./DeleteModal";

const ManageRiceSeed = ({ firebase }) => {
  const [toastInfo, setToastInfo] = useState({
    content: "",
    error: false,
    duration: 2500,
  });
  const [showToast, setShowToast] = useState(false);
  const [shouldModalOpen, setShouldModalOpen] = useState(false);
  const [riceSeeds, setRiceSeeds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldDeleteModalOpen, setShouldDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [riceSeedToBeDeleted, setRiceSeedToBeDeleted] = useState(null);
  const [riceSeedToBeEdited, setRiceSeedToBeEdited] = useState({});

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

  const handleAddRiceSeedButtonClicked = useCallback(() => {
    setShouldModalOpen(true);
  }, []);

  const handleModalClosed = useCallback(() => {
    setShouldModalOpen(false);
    setRiceSeedToBeEdited({});
  }, []);

  useEffect(() => {
    getRiceSeeds();
  }, []);

  const getRiceSeeds = useCallback(async () => {
    setIsLoading(true);
    const riceSeeds = await firebase.firestore
      .collection("riceSeed")
      .doc(process.env.REACT_APP_RICESEED_ID)
      .collection("data")
      .get();
    setRiceSeeds(
      riceSeeds.docs.map((riceSeed) => {
        const riceSeedData = riceSeed.data();
        return {
          id: riceSeedData.id,
          name: riceSeedData.name,
          description: riceSeedData.description,
          cropYields: riceSeedData.cropYields,
          buyPrice: riceSeedData.buyPrice,
          sellPrice: riceSeedData.sellPrice,
          ingredientTotalPrice: riceSeedData.ingredientTotalPrice,
          locations: Object.keys(riceSeedData.locations),
          soils: Object.keys(riceSeedData.soils),
          weathers: Object.keys(riceSeedData.weathers),
          ingredients: riceSeedData.ingredients.map(
            (ingredient) => ingredient.fee.title
          ),
          stages: riceSeedData.stages.map((stage) => stage.stageName),
        };
      })
    );
    setIsLoading(false);
  }, []);

  const handleDeleteRiceSeed = useCallback(async (item) => {
    setShouldDeleteModalOpen(true);
    setRiceSeedToBeDeleted(item.id);
  }, []);

  const handleDeleteModalDone = useCallback(async () => {
    setIsDeleting(true);
    try {
      await firebase.firestore
        .collection("riceSeed")
        .doc(process.env.REACT_APP_RICESEED_ID)
        .collection("data")
        .doc(riceSeedToBeDeleted)
        .delete();
      displayToast("Rice seed deleted successfully!");
      getRiceSeeds();
    } catch (err) {
      console.log("error from firebase delete rice seed", err);
      displayToast("Server error occurred", true);
    }
    setIsDeleting(false);
    setShouldDeleteModalOpen(false);
  }, [riceSeedToBeDeleted]);

  const handleDeleteModalClosed = useCallback(() => {
    setShouldDeleteModalOpen(false);
  }, []);

  const handleEditRiceSeed = useCallback((item) => {
    setShouldModalOpen(true);
    setRiceSeedToBeEdited(item);
  }, []);

  useEffect(() => {}, [riceSeedToBeEdited]);

  const resourceListHeaders = (
    <table className="table-container" role="table" aria-label="Rice seeds">
      <thead>
        <tr className="flex-table header" role="rowgroup">
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Name</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Description</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Crop yields</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Buy price</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Sell price</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Ingredient price</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Ingredients</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Stages</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Locations</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Soils</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Weathers</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <Button primary onClick={handleAddRiceSeedButtonClicked}>
              Add Rice seed
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
                {item.name}
              </td>
              <td className="flex-row" role="cell">
                {item.description}
              </td>
              <td className="flex-row" role="cell">
                {item.cropYields}
              </td>
              <td className="flex-row" role="cell">
                ${item.buyPrice}
              </td>
              <td className="flex-row" role="cell">
                ${item.sellPrice}
              </td>
              <td className="flex-row" role="cell">
                ${item.ingredientTotalPrice}
              </td>
              <td className="flex-row" role="cell">
                {item.ingredients.join(",")}
              </td>
              <td className="flex-row" role="cell">
                {item.stages.join(",")}
              </td>
              <td className="flex-row" role="cell">
                {item.locations.join(",")}
              </td>
              <td className="flex-row" role="cell">
                {item.soils.join(",")}
              </td>
              <td className="flex-row" role="cell">
                {item.weathers.join(",")}
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
                      handleEditRiceSeed(item);
                    }}
                  >
                    Edit
                  </Button>
                </div>
                <Button
                  plain
                  destructive
                  onClick={() => {
                    handleDeleteRiceSeed(item);
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
            items={riceSeeds}
            renderItem={renderItem}
          />
          <CreateRiceSeedModal
            shouldOpen={shouldModalOpen}
            handleModalClosed={handleModalClosed}
            handleModalDone={() => {
              getRiceSeeds();
              setShouldModalOpen(false);
            }}
            defaultRiceSeed={riceSeedToBeEdited}
          />
          <DeleteModal
            shouldOpen={shouldDeleteModalOpen}
            handleModalClosed={handleDeleteModalClosed}
            title="Delete Rice seed"
            isDeleting={isDeleting}
            handlePrimaryActionClicked={handleDeleteModalDone}
          />
        </Card>
      </Frame>
    </Page>
  );
};

export default withFirebase(ManageRiceSeed);
