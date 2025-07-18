import React from "react";
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Box } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openMenu, setOpenMenu] = React.useState(false);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpenMenu(true);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setOpenMenu(false);
  };

  return (
    <AppBar position="sticky" sx={{ background: "#3f51b5" }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Cricketer Records
        </Typography>

        {/* Desktop Menu */}
        <Box sx={{ display: { xs: "none", md: "flex" } }}>
          <Button color="inherit" component={Link} to="/">
            Check
          </Button>
          <Button color="inherit" component={Link} to="/upload">
            Upload
          </Button>
        </Box>

        {/* Mobile Menu */}
        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuClick}
          >
            <MenuIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem onClick={handleMenuClose} component={Link} to="/">
              Check
            </MenuItem>
            <MenuItem onClick={handleMenuClose} component={Link} to="/upload">
              Upload
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
