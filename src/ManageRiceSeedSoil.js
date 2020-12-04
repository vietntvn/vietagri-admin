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
import CreateRiceSeedSoilModal from "./CreateRiceSeedSoilModal";
import DeleteModal from "./DeleteModal";

const ManageRiceSeedSoil = ({ firebase }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [riceSeedSoils, setRiceSeedSoils] = useState([]);
  const [shouldModalOpen, setShouldModalOpen] = useState(false);
  const [soilToBeEdited, setSoilToBeEdited] = useState({});
  const [soilToBeDeleted, setSoilToBeDeleted] = useState({});
  const [toastInfo, setToastInfo] = useState({
    content: "",
    error: false,
    duration: 2500,
  });
  const [showToast, setShowToast] = useState(false);
  const [shouldDeleteModalOpen, setShouldDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    getRiceSeedSoils();
  }, []);

  const getRiceSeedSoils = useCallback(async () => {
    setIsLoading(true);
    const soils = await firebase.firestore
      .collection("soil")
      .doc(process.env.REACT_APP_SOILS_ID)
      .collection("data")
      .get();
    setRiceSeedSoils(soils.docs.map((soil) => soil.data()));
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

  const handleAddRiceSeedSoilButtonClicked = useCallback(() => {
    setShouldModalOpen(true);
  }, []);

  const handleModalClosed = useCallback(() => {
    setShouldModalOpen(false);
    setSoilToBeEdited({});
  }, []);

  const handleEditRiceSeedSoil = useCallback((item) => {
    setSoilToBeEdited(item);
    setShouldModalOpen(true);
  }, []);

  const handleDeleteRiceSeedSoil = useCallback((item) => {
    setSoilToBeDeleted(item);
    setShouldDeleteModalOpen(true);
  }, []);

  const handleDeleteModalClosed = useCallback(() => {
    setShouldDeleteModalOpen(false);
  }, []);

  const handleDeleteModalDone = useCallback(async () => {
    setIsDeleting(true);
    await firebase.firestore
      .collection("soil")
      .doc(process.env.REACT_APP_SOILS_ID)
      .collection("data")
      .doc(soilToBeDeleted.id)
      .delete();
    setShouldDeleteModalOpen(false);
    getRiceSeedSoils();
    displayToast("Soil deleted successfully!");
    setIsDeleting(false);
  }, [soilToBeDeleted]);

  const resourceListHeaders = (
    <table className="table-container" role="table" aria-label="Rice seeds">
      <thead>
        <tr className="flex-table header" role="rowgroup">
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Soil Name</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Soil Description</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <Button primary onClick={handleAddRiceSeedSoilButtonClicked}>
              Add Rice Seed Soil
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
                <div
                  style={{
                    marginRight: ".8rem",
                    display: "inline",
                  }}
                >
                  <Button
                    plain
                    onClick={() => {
                      handleEditRiceSeedSoil(item);
                    }}
                  >
                    Edit
                  </Button>
                </div>
                <Button
                  plain
                  destructive
                  onClick={() => {
                    handleDeleteRiceSeedSoil(item);
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
            items={riceSeedSoils}
            renderItem={renderItem}
          />
          <CreateRiceSeedSoilModal
            shouldOpen={shouldModalOpen}
            handleModalClosed={handleModalClosed}
            handleModalDone={() => {
              setShouldModalOpen(false);
              getRiceSeedSoils();
            }}
            defaultRiceSeedSoil={soilToBeEdited}
          />
          <DeleteModal
            shouldOpen={shouldDeleteModalOpen}
            handleModalClosed={handleDeleteModalClosed}
            title="Delete Rice Seed Soil"
            isDeleting={isDeleting}
            handlePrimaryActionClicked={handleDeleteModalDone}
          />
        </Card>
      </Frame>
    </Page>
  );
};

export default withFirebase(ManageRiceSeedSoil);
