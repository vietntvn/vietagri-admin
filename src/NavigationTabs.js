import React, { useState, useEffect } from "react";
import { Card, Tabs } from "@shopify/polaris";
import { useHistory, useLocation } from "react-router-dom";

function NavigationTabs() {
  const history = useHistory();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selected, setSelected] = useState(getSelectedTab(location.pathname));

  useEffect(() => {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    if (username && password) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  function getSelectedTab(path) {
    if (path.startsWith("/") && path.length === 1) {
      return 0;
    } else if (path.startsWith("/manage-rice-seed-stages")) {
      return 2;
    } else if (path.startsWith("/manage-rice-seed-ingredients")) {
      return 3;
    } else if (path.startsWith("/manage-rice-seed-locations")) {
      return 4;
    } else if (path.startsWith("/manage-rice-seed-soils")) {
      return 5;
    } else if (path.startsWith("/manage-rice-seed-weathers")) {
      return 6;
    } else if (path.startsWith("/manage-rice-seed")) {
      return 1;
    } else if (path.startsWith("/logout")) {
      return 7;
    }
  }

  function handleTabChange(idRoute) {
    setSelected(idRoute);
    switch (idRoute) {
      case 0:
        return history.push("/");
      case 1:
        return history.push("/manage-rice-seed");
      case 2:
        return history.push("/manage-rice-seed-stages");
      case 3:
        return history.push("/manage-rice-seed-ingredients");
      case 4:
        return history.push("/manage-rice-seed-locations");
      case 5:
        return history.push("/manage-rice-seed-soils");
      case 6:
        return history.push("/manage-rice-seed-weathers");
      case 7:
        localStorage.removeItem("username");
        localStorage.removeItem("password");
        window.location.replace("/");
        break;
      default:
        return history.push("/");
    }
  }

  const tabs = isLoggedIn
    ? [
        {
          id: "Home",
          content: "Home",
        },
        {
          id: "Manage Rice Seeds",
          content: "Manage Rice Seeds",
        },
        {
          id: "Manage Rice Seeds Stages",
          content: "Manage Rice Seeds Stages",
        },
        {
          id: "Manage Rice Seeds Ingredients",
          content: "Manage Rice Seeds Ingredients",
        },
        {
          id: "Manage Rice Seeds Locations",
          content: "Manage Rice Seeds Locations",
        },
        {
          id: "Manage Rice Seeds Soils",
          content: "Manage Rice Seeds Soils",
        },
        {
          id: "Manage Rice Seeds Weathers",
          content: "Manage Rice Seeds Weathers",
        },
        {
          id: "Logout",
          content: "Logout",
        },
      ]
    : [
        {
          id: "Home",
          content: "Home",
        },
      ];

  return (
    <React.Fragment>
      <Card>
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}></Tabs>
      </Card>
    </React.Fragment>
  );
}
export default NavigationTabs;
