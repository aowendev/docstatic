import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "api/petstore/swagger-petstore-yaml",
    },
    {
      type: "category",
      label: "Pets",
      link: {
        type: "doc",
        id: "api/petstore/pet",
      },
      items: [
        {
          type: "doc",
          id: "api/petstore/schemas/cat",
          label: "Cat",
          className: "schema",
        },
        {
          type: "doc",
          id: "api/petstore/add-pet",
          label: "Add a new pet to the store",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/petstore/update-pet",
          label: "Update an existing pet",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api/petstore/get-pet-by-id",
          label: "Find pet by ID",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/petstore/update-pet-with-form",
          label: "Updates a pet in the store with form data",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/petstore/delete-pet",
          label: "Deletes a pet",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/petstore/upload-file",
          label: "uploads an image",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/petstore/find-pets-by-status",
          label: "Finds Pets by status",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/petstore/find-pets-by-tags",
          label: "Finds Pets by tags",
          className: "menu__list-item--deprecated api-method get",
        },
        {
          type: "doc",
          id: "api/petstore/new-pet",
          label: "New pet",
          className: "api-method event",
        },
      ],
    },
    {
      type: "category",
      label: "Petstore Orders",
      link: {
        type: "doc",
        id: "api/petstore/store",
      },
      items: [
        {
          type: "doc",
          id: "api/petstore/get-inventory",
          label: "Returns pet inventories by status",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/petstore/place-order",
          label: "Place an order for a pet",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/petstore/get-order-by-id",
          label: "Find purchase order by ID",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/petstore/delete-order",
          label: "Delete purchase order by ID",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/petstore/subscribe-to-the-store-events",
          label: "Subscribe to the Store events",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Users",
      link: {
        type: "doc",
        id: "api/petstore/user",
      },
      items: [
        {
          type: "doc",
          id: "api/petstore/create-user",
          label: "Create user",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/petstore/get-user-by-name",
          label: "Get user by user name",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/petstore/update-user",
          label: "Updated user",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/petstore/delete-user",
          label: "Delete user",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/petstore/create-users-with-array-input",
          label: "Creates list of users with given input array",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/petstore/create-users-with-list-input",
          label: "Creates list of users with given input list",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/petstore/login-user",
          label: "Logs user into the system",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/petstore/logout-user",
          label: "Logs out current logged in user session",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
