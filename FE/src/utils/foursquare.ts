const fetchAutocompletePlaces = async (query: string, lat?: number, lon?: number) => {
    const API_KEY = process.env.NEXT_PUBLIC_FOURSQUARE_PLACES_API;
    if (!API_KEY) throw new Error("Foursquare API key is not defined");
  
    const endpoint = "https://api.foursquare.com/v3/places/search";
    const params = new URLSearchParams({
        query,
         near: "Vietnam",      
    limit: "10",
    sort: "RELEVANCE", 
      });
      
  
    const res = await fetch(`${endpoint}?${params}`, {
      headers: {
        Authorization: API_KEY,
        Accept: "application/json",
      },
    });
  
    if (!res.ok) throw new Error("Failed to fetch autocomplete results");
    const data = await res.json();
    return data.results;
  };

  export { fetchAutocompletePlaces };
