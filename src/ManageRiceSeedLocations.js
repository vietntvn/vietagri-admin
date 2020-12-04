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
import CreateRiceSeedLocationModal from "./CreateRiceSeedLocationModal";
import DeleteModal from "./DeleteModal";

const ManageRiceSeedLocations = ({ firebase }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [riceSeedLocations, setRiceSeedLocations] = useState([]);
  const [shouldModalOpen, setShouldModalOpen] = useState(false);
  const [locationToBeEdited, setLocationToBeEdited] = useState({});
  const [locationToBeDeleted, setLocationToBeDeleted] = useState({});
  const [toastInfo, setToastInfo] = useState({
    content: "",
    error: false,
    duration: 2500,
  });
  const [showToast, setShowToast] = useState(false);
  const [shouldDeleteModalOpen, setShouldDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    getRiceSeedLocations();
  }, []);

  const getRiceSeedLocations = useCallback(async () => {
    setIsLoading(true);
    const locations = await firebase.firestore
      .collection("locations")
      .doc(process.env.REACT_APP_LOCATIONS_ID)
      .collection("data")
      .get();
    setRiceSeedLocations(locations.docs.map((location) => location.data()));
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

  const handleAddRiceSeedLocationButtonClicked = useCallback(() => {
    setShouldModalOpen(true);
  }, []);

  const handleModalClosed = useCallback(() => {
    setShouldModalOpen(false);
    setLocationToBeEdited({});
  }, []);

  const handleEditRiceSeedLocation = useCallback((item) => {
    setLocationToBeEdited(item);
    setShouldModalOpen(true);
  }, []);

  const handleDeleteRiceSeedLocation = useCallback((item) => {
    setLocationToBeDeleted(item);
    setShouldDeleteModalOpen(true);
  }, []);

  const handleDeleteModalClosed = useCallback(() => {
    setShouldDeleteModalOpen(false);
  }, []);

  const handleDeleteModalDone = useCallback(async () => {
    setIsDeleting(true);
    await firebase.firestore
      .collection("locations")
      .doc(process.env.REACT_APP_LOCATIONS_ID)
      .collection("data")
      .doc(locationToBeDeleted.id)
      .delete();
    setShouldDeleteModalOpen(false);
    getRiceSeedLocations();
    displayToast("Location deleted successfully!");
    setIsDeleting(false);
  }, [locationToBeDeleted]);

  const resourceListHeaders = (
    <table className="table-container" role="table" aria-label="Rice seeds">
      <thead>
        <tr className="flex-table header" role="rowgroup">
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">No</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Location Name</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <Button primary onClick={handleAddRiceSeedLocationButtonClicked}>
              Add Rice Seed Location
            </Button>
          </th>
        </tr>
      </thead>
    </table>
  );

  const renderItem = useCallback((item, id, index) => {
    return (
      <ResourceItem id={id} onClick={() => {}}>
        <table className="table-container">
          <tbody>
            <tr className="flex-table row" role="rowgroup">
              <td className="flex-row" role="cell">
                {index + 1}
              </td>
              <td className="flex-row" role="cell">
                {item.name}
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
                      handleEditRiceSeedLocation(item);
                    }}
                  >
                    Edit
                  </Button>
                </div>
                <Button
                  plain
                  destructive
                  onClick={() => {
                    handleDeleteRiceSeedLocation(item);
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
            items={riceSeedLocations}
            renderItem={renderItem}
          />
          <CreateRiceSeedLocationModal
            shouldOpen={shouldModalOpen}
            handleModalClosed={handleModalClosed}
            handleModalDone={() => {
              setLocationToBeEdited({});
              setShouldModalOpen(false);
              getRiceSeedLocations();
            }}
            defaultRiceSeedLocation={locationToBeEdited}
          />
          <DeleteModal
            shouldOpen={shouldDeleteModalOpen}
            handleModalClosed={handleDeleteModalClosed}
            title="Delete Rice Seed Location"
            isDeleting={isDeleting}
            handlePrimaryActionClicked={handleDeleteModalDone}
          />
        </Card>
      </Frame>
    </Page>
  );
};

export default withFirebase(ManageRiceSeedLocations);
