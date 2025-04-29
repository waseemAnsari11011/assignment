"use client";

const Mygloballoader = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "none",
        justifyContent: "center",
        alignItems: "center",
        padding: "10px",
        zIndex: "20",
      }}
      className="loaderoverlay"
    >
      <div id="myloader"></div>
    </div>
  );
};

export default Mygloballoader;
