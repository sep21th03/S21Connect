import { Spinner } from "reactstrap";

export default function Custom404() {
  return (
    <div
      style={{
        backgroundColor: "#000",
        color: "#fff",
        height: "100vh",
        margin: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        textAlign: "center",
      }}
    >
      <Spinner />
    </div>
  );
}
