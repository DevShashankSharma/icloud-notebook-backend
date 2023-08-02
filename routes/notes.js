const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/FetchUser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

//Route 1 :  get all the notes using : GET "/api/notes/fetchAllNotes". login require  => Fetch all notes EndPoint
router.get("/fetchAllNotes", fetchUser, async (req, res) => {
  try {
    // fetching notes of user
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//Route 2 :  add the notes using : POST "/api/notes/addNotes". login require  => Add notes EndPoint
router.post(
  "/addNotes",
  fetchUser,
  //checks for adding a notes
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description consists of atleast 5 character").isLength(
      {
        min: 5,
      }
    ),
  ],
  async (req, res) => {
    try {
      //If there are errors then return Bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { title, description, tag } = req.body;

      // Adding notes of user
      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const SavedNote = await note.save();

      res.json(SavedNote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//Route 3 :  Update the notes using : PUT "/api/notes/updateNotes/:id". login require  => Update notes EndPoint
router.put("/updateNote/:id", fetchUser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;

    //creating a newNotes object
    const newNotes = {};
    //updating
    if (title) {
      newNotes.title = title;
    }
    if (description) {
      newNotes.description = description;
    }
    if (tag) {
      newNotes.tag = tag;
    }
    //Find the not to be updated and update it
    let note = await Notes.findById(req.params.id);
    //if id is note exists
    if (!note) {
      return res.status(404).send("Not Found");
    }

    //if the requested id is not equal to the id through which the note is created
    if (note.user.toString() !== req.user.id.toString()) {
      return res.status(401).send("Not Allowed");
    }

    //updating note
    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNotes },
      { new: true }
    );

    res.json({ note });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal Server Error");
  }
});

//Route 4 :  Delete the notes using : DELETE "/api/notes/deleteNotes/:id". login require  => Delete notes EndPoint
router.delete("/deleteNotes/:id", fetchUser, async (req, res) => {
  try {
    //Find the not to be deleted and Delete it
    let note = await Notes.findById(req.params.id);
    //if id is note exists
    if (!note) {
      return res.status(404).send("Not Found");
    }

    //if the requested id is not equal to the id through which the note is created
    if (note.user.toString() !== req.user.id.toString()) {
      return res.status(401).send("Not Allowed");
    }

    //Deleting note
    note = await Notes.findByIdAndDelete(req.params.id);

    res.json({ Success: "Note has been deleted successfully", note: note });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
