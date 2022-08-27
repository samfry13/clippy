import { AppBar, Toolbar, Typography } from "@mui/material";
import { useRouter } from "next/router";

const Navbar = () => {
  const router = useRouter();

  return (
    <nav>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: "pointer" }}
            onClick={() => router.push("/")}
          >
            Clippy
          </Typography>
        </Toolbar>
      </AppBar>
    </nav>
  );
};

export default Navbar;
