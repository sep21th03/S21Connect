import { FC, useEffect, useState } from "react";
import DynamicFeatherIcon from "../DynamicFeatherIcon";
import { Input } from "reactstrap";
import { Href } from "../../utils/constant";
import { feelings, friendsNames } from "@/Data/common";
import { OptionsInputsInterFace } from "../CommonInterFace";
import { debounce } from "lodash";
import { fetchAutocompletePlaces } from "@/utils/foursquare";
import { useMemo } from "react";

const OptionsInputs: FC<OptionsInputsInterFace> = ({
  OptionsInput,
  setOptionInput,
  listFriends,
  setSelectedFeeling,
  setSelectedPlace,
  setTaggedFriends,
  tagInput,
  setTagInput,
}) => {
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeResults, setPlaceResults] = useState<any[]>([]);
  const [isPlaceSelected, setIsPlaceSelected] = useState(false);
  useEffect(() => {
    const matched = listFriends.filter((f) =>
      `${f.first_name} ${f.last_name}`
        .toLowerCase()
        .includes(tagInput.toLowerCase())
    );
    const ids = matched.map((f) => f.id.toString());
    setTaggedFriends(ids);
  }, [tagInput]);

  const handleSearchPlace = useMemo(
    () =>
      debounce(async (value: string) => {
        if (!value) return setPlaceResults([]);
        try {
          const results = await fetchAutocompletePlaces(value);
          setPlaceResults(results);
        } catch (err) {
          console.error("Error fetching places:", err);
        }
      }, 1000),
    []
  );

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setTagInput(inputValue);

    const selectedFriend = listFriends.find(
      (f) => `${f.first_name} ${f.last_name}` === inputValue
    );
    if (selectedFriend) {
      setTaggedFriends([selectedFriend.id.toString()]);
    }
  };

  useEffect(() => {
    if (!placeQuery || isPlaceSelected) {
      setPlaceResults([]);
      setIsPlaceSelected(false);
      return;
    }

    handleSearchPlace(placeQuery);
  }, [placeQuery]);

  useEffect(() => {
    return () => {
      handleSearchPlace.cancel();
    };
  }, []);

  return (
    <div className={`options-input ${OptionsInput}`}>
      <a href={Href}>
        <DynamicFeatherIcon
          iconName="X"
          className="iw-15 icon-font-light icon-close"
          onClick={() => setOptionInput("")}
        />
      </a>
      <div className="search-input feeling-input">
        <Input
          type="text"
          className="enable"
          placeholder="How Are You Feeling?"
          list="feelings"
          onChange={(e) => setSelectedFeeling(e.target.value)}
        />
        <datalist id="feelings">
          {feelings.map((data, index) => (
            <option value={data} key={index} />
          ))}
        </datalist>
        <a href={Href}>
          <DynamicFeatherIcon
            iconName="Smile"
            className="iw-15 icon-left icon-font-light"
          />
        </a>
      </div>
      <div
        className="search-input place-input"
        style={{ position: "relative" }}
      >
        <Input
          type="text"
          placeholder="search for places..."
          value={placeQuery}
          onChange={(e) => setPlaceQuery(e.target.value)}
        />
        <a href={Href}>
          <DynamicFeatherIcon
            iconName="Smile"
            className="iw-15 icon-left icon-font-light"
          />
          <DynamicFeatherIcon
            iconName="MapPin"
            className="iw-15 icon-left icon-font-light"
          />
        </a>
        {placeResults.length > 0 && (
          <ul
            className="autocomplete-list"
            style={{
              position: "absolute",
              top: "100%",
              left: "0",
              width: "100%",
              zIndex: "1000",
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "0px 10px",
            }}
          >
            {placeResults.map((place: any) => (
              <li
                key={place.fsq_id}
                onClick={() => {
                  setPlaceQuery(place?.location?.formatted_address);
                  setSelectedPlace(place?.location?.formatted_address);
                  setPlaceResults([]);
                  setIsPlaceSelected(true);
                }}
              >
                <div
                  style={{
                    fontWeight: "500",
                    fontSize: "0.75rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  {place?.location?.formatted_address}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="search-input friend-input">
        <Input
          type="text"
          placeholder="Tìm bạn bè..."
          list="Friends"
          value={tagInput}
          onChange={handleTagInputChange}
        />
        <datalist id="Friends">
          {listFriends.map((data, index) => (
            <option
              key={index}
              value={data.first_name + " " + data.last_name}
              data-id={data.id}
            />
          ))}
        </datalist>
        <a href={Href}>
          <DynamicFeatherIcon
            iconName="MapPin"
            className="iw-15 icon-left icon-font-light"
          />
          <DynamicFeatherIcon
            iconName="Tag"
            className="iw-15 icon-left icon-font-light"
          />
        </a>
      </div>
    </div>
  );
};

export default OptionsInputs;
