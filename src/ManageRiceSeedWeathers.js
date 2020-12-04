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
import CreateRiceSeedWeatherModal from "./CreateRiceSeedWeatherModal";
import DeleteModal from "./DeleteModal";

const ManageRiceSeedWeathers = ({ firebase }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [riceSeedWeathers, setRiceSeedWeathers] = useState([]);
  const [shouldModalOpen, setShouldModalOpen] = useState(false);
  const [weatherToBeEdited, setWeatherToBeEdited] = useState({});
  const [weatherToBeDeleted, setWeatherToBeDeleted] = useState({});
  const [toastInfo, setToastInfo] = useState({
    content: "",
    error: false,
    duration: 2500,
  });
  const [showToast, setShowToast] = useState(false);
  const [shouldDeleteModalOpen, setShouldDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    getRiceSeedWeathers();
  }, []);

  const getRiceSeedWeathers = useCallback(async () => {
    setIsLoading(true);
    const weathers = await firebase.firestore
      .collection("weather")
      .doc(process.env.REACT_APP_WEATHERS_ID)
      .collection("data")
      .get();
    setRiceSeedWeathers(weathers.docs.map((weather) => weather.data()));
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

  const handleAddRiceSeedWeatherButtonClicked = useCallback(() => {
    setShouldModalOpen(true);
  }, []);

  const handleModalClosed = useCallback(() => {
    setShouldModalOpen(false);
    setWeatherToBeEdited({});
  }, []);

  const handleEditRiceSeedWeather = useCallback((item) => {
    setWeatherToBeEdited(item);
    setShouldModalOpen(true);
  }, []);

  const handleDeleteRiceSeedWeather = useCallback((item) => {
    setWeatherToBeDeleted(item);
    setShouldDeleteModalOpen(true);
  }, []);

  const handleDeleteModalClosed = useCallback(() => {
    setShouldDeleteModalOpen(false);
  }, []);

  const handleDeleteModalDone = useCallback(async () => {
    setIsDeleting(true);
    await firebase.firestore
      .collection("weather")
      .doc(process.env.REACT_APP_WEATHERS_ID)
      .collection("data")
      .doc(weatherToBeDeleted.id)
      .delete();
    setShouldDeleteModalOpen(false);
    getRiceSeedWeathers();
    displayToast("Weather deleted successfully!");
    setIsDeleting(false);
  }, [weatherToBeDeleted]);

  const resourceListHeaders = (
    <table className="table-container" role="table" aria-label="Rice seeds">
      <thead>
        <tr className="flex-table header" role="rowgroup">
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Weather Name</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Weather Description</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <Button primary onClick={handleAddRiceSeedWeatherButtonClicked}>
              Add Rice Seed Weather
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
                      handleEditRiceSeedWeather(item);
                    }}
                  >
                    Edit
                  </Button>
                </div>
                <Button
                  plain
                  destructive
                  onClick={() => {
                    handleDeleteRiceSeedWeather(item);
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
            items={riceSeedWeathers}
            renderItem={renderItem}
          />
          <CreateRiceSeedWeatherModal
            shouldOpen={shouldModalOpen}
            handleModalClosed={handleModalClosed}
            handleModalDone={() => {
              setShouldModalOpen(false);
              getRiceSeedWeathers();
            }}
            defaultRiceSeedWeather={weatherToBeEdited}
          />
          <DeleteModal
            shouldOpen={shouldDeleteModalOpen}
            handleModalClosed={handleDeleteModalClosed}
            title="Delete Rice Seed Weather"
            isDeleting={isDeleting}
            handlePrimaryActionClicked={handleDeleteModalDone}
          />
        </Card>
      </Frame>
    </Page>
  );
};

export default withFirebase(ManageRiceSeedWeathers);
